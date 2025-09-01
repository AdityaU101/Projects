import math
import os
import sys

sys.stderr = open(os.devnull, 'w')
import json
import pickle
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split, GridSearchCV, StratifiedKFold
from sklearn.preprocessing import LabelEncoder, StandardScaler, MinMaxScaler
from sklearn.metrics import accuracy_score 
from xgboost import XGBClassifier 
sys.stderr = sys.__stderr__  # Restore stderr

from sklearn.impute import KNNImputer
from sklearn.preprocessing import LabelEncoder

import warnings
warnings.filterwarnings("ignore")
warnings.filterwarnings("ignore", category=UserWarning, module="xgboost")

DATA_PATH = "./Data/osr_single_node/"
CONSOLIDATED_DESTINATION = "./data-checkpoint/consolidated-data.csv"
CONSOLIDATED_DATA_COLUMNS = ["instance", "workload", "program", "datasize", "elapsed_time", "input_size", "throughput_node", "avg_cpu", "avg_mem", "avg_disk","avg_disk_read", "avg_disk_write"]
INSTANCE_PRICES = {
    "c4.large": 0.10,
    "c4.xlarge": 0.20,
    "c4.2xlarge": 0.40,
    "c3.large": 0.11,
    "c3.xlarge": 0.21,
    "c3.2xlarge": 0.42,
    "m4.large": 0.10,
    "m4.xlarge": 0.20,
    "m4.2xlarge": 0.40,
    "m3.large": 0.13,
    "m3.xlarge": 0.27,
    "m3.2xlarge": 0.53,
    "r4.large": 0.13,
    "r4.xlarge": 0.27,
    "r4.2xlarge": 0.53,
    "r3.large": 0.17,
    "r3.xlarge": 0.33,
    "r3.2xlarge": 0.67,
}
INSTANCE_SPECS = {
    "c4.large": {
        "vCPU": 2,
        "memory": 3.75  # GiB
    },
    "c4.xlarge": {
        "vCPU": 4,
        "memory": 7.5  # GiB
    },
    "c4.2xlarge": {
        "vCPU": 8,
        "memory": 15  # GiB
    },
    "c3.large": {
        "vCPU": 2,
        "memory": 3.75  # GiB
    },
    "c3.xlarge": {
        "vCPU": 4,
        "memory": 7.5  # GiB
    },
    "c3.2xlarge": {
        "vCPU": 8,
        "memory": 15  # GiB
    },
    "m4.large": {
        "vCPU": 2,
        "memory": 8  # GiB
    },
    "m4.xlarge": {
        "vCPU": 4,
        "memory": 16  # GiB
    },
    "m4.2xlarge": {
        "vCPU": 8,
        "memory": 32  # GiB
    },
    "m3.large": {
        "vCPU": 2,
        "memory": 7.5  # GiB
    },
    "m3.xlarge": {
        "vCPU": 4,
        "memory": 15  # GiB
    },
    "m3.2xlarge": {
        "vCPU": 8,
        "memory": 30  # GiB
    },
    "r4.large": {
        "vCPU": 2,
        "memory": 15.25  # GiB
    },
    "r4.xlarge": {
        "vCPU": 4,
        "memory": 30.5  # GiB
    },
    "r4.2xlarge": {
        "vCPU": 8,
        "memory": 61  # GiB
    },
    "r3.large": {
        "vCPU": 2,
        "memory": 15  # GiB
    },
    "r3.xlarge": {
        "vCPU": 4,
        "memory": 30  # GiB
    },
    "r3.2xlarge": {
        "vCPU": 8,
        "memory": 60  # GiB
    },
}

workload_le = LabelEncoder()
instance_le = LabelEncoder()
scaler = StandardScaler()  # Use StandardScaler or MinMaxScaler
def add_instance_specs(df, instance_specs):
    """Adds vCPU and memory capacity as columns to the DataFrame."""
    vcpu_list = []
    mem_list = []
    for instance_type in df['instance']:
        vcpu_list.append(instance_specs.get(instance_type, {}).get("vCPU"))
        mem_list.append(instance_specs.get(instance_type, {}).get("memory"))

    df['capacity_cpu'] = vcpu_list
    df['capacity_mem'] = mem_list

    df.head()
    return df
def add_features(df, instance_specs):
    df = add_instance_specs(df, instance_specs)

    df['avg_cpu'] = pd.to_numeric(df['avg_cpu'], errors='coerce')  
    df['avg_mem'] = pd.to_numeric(df['avg_mem'], errors='coerce')
    df['utilized_fraction_cpu'] = (df['avg_cpu'] / 100) * df['capacity_cpu']
    df['utilized_fraction_mem'] = (df['avg_mem'] / 100) * df['capacity_mem']

    df['cpu_headroom'] = df['capacity_cpu'] - df['utilized_fraction_cpu']
    df['mem_headroom'] = df['capacity_mem'] - df['utilized_fraction_mem']

    df['cpu_pressure'] = 1 / (df['cpu_headroom'] + 1e-9)  
    df['mem_pressure'] = 1 / (df['mem_headroom'] + 1e-9)

    df['utilized_cpu_mem_ratio'] = df['utilized_fraction_cpu'] / (df['utilized_fraction_mem'] + 1e-9)
    df['capacity_cpu_mem_ratio'] = df['capacity_cpu'] / df['capacity_mem']

    df[['utilized_fraction_cpu', 'utilized_fraction_mem', 'cpu_headroom', 'mem_headroom',
       'cpu_pressure', 'mem_pressure', 'utilized_cpu_mem_ratio', 'capacity_cpu_mem_ratio']] = df.groupby('workload')[['utilized_fraction_cpu', 'utilized_fraction_mem', 'cpu_headroom', 'mem_headroom',
       'cpu_pressure', 'mem_pressure', 'utilized_cpu_mem_ratio', 'capacity_cpu_mem_ratio']].transform(lambda x: StandardScaler().fit_transform(x.values.reshape(-1,1)).flatten()) #Scale new features
    
    return df
def process_data(path):
    instances = os.listdir(path)
    processed_data = []

    for directory in instances:
        if str(directory).endswith(".txt"):
            continue
        
        instance, _, workload, program, *_ = directory.split("_")
        data = pd.read_csv(f"{path}/{directory}/sar.csv")
        
        with open(f"{path}/{directory}/report.json") as report_file:
            report = json.load(report_file)
            datasize = report.get("datasize")
            elapsed_time = float(report.get("elapsed_time", -1))
            input_size = float(report.get("input_size", -1))
            throughput_node = float(report.get("throughput_node", -1))

        avg_cpu = data["cpu.%usr"].mean()
        avg_mem = data["memory.%memused"].mean()
        avg_disk = data["disk.%util"].mean()
        avg_disk_read = data["disk.rd_sec/s"].mean()
        avg_disk_write = data["disk.wr_sec/s"].mean()
        
        if math.isnan(avg_cpu) or math.isnan(avg_mem) or math.isnan(avg_disk) or math.isnan(avg_disk_read) or math.isnan(avg_disk_write):
            continue

        processed_data.append([
            instance, workload, program, datasize, elapsed_time, input_size,
            throughput_node, avg_cpu, avg_mem, avg_disk, avg_disk_read, avg_disk_write
        ])

    df = pd.DataFrame(processed_data, columns=CONSOLIDATED_DATA_COLUMNS)
    df = add_features(df, INSTANCE_SPECS) 

    df.head()
    return df
def impute_missing_by_group(df, group_cols, target_cols, imputation_method='random'):
    """Imputes missing values (-1) in a DataFrame by group."""
    
    df_imputed = df.copy()

    # Label Encode Workload and Data Size
    le_workload = LabelEncoder()
    df_imputed['workload_encoded'] = le_workload.fit_transform(df_imputed['workload'])

    le_datasize = LabelEncoder()
    df_imputed['datasize_encoded'] = le_datasize.fit_transform(df_imputed['datasize'])

    # Define columns for imputation and scaling (including encoded workload and datasize)
    cols_to_impute = ['elapsed_time', 'input_size']
    cols_to_scale = ['avg_cpu', 'avg_mem', 'avg_disk', 'avg_disk_read', 'avg_disk_write']
    imputation_cols = cols_to_impute + cols_to_scale 

    # Replace -1 with NaN for KNNImputer to recognize them
    df_imputed[imputation_cols] = df_imputed[imputation_cols].replace(-1, np.nan)

    # Scale numerical features before imputation
    df_imputed[cols_to_scale] = scaler.fit_transform(df_imputed[cols_to_scale])

    # Impute missing values using KNN
    imputer = KNNImputer(n_neighbors=8)
    df_imputed[imputation_cols] = imputer.fit_transform(df_imputed[imputation_cols])

    # Inverse transform the scaled features after imputation
    df_imputed[cols_to_scale] = scaler.inverse_transform(df_imputed[cols_to_scale])

    # Decode back workload and datasize from numerical value:
    df_imputed['workload'] = le_workload.inverse_transform(df_imputed['workload_encoded'].astype(int))
    df_imputed['datasize'] = le_datasize.inverse_transform(df_imputed['datasize_encoded'].astype(int))

    df_imputed = df_imputed.drop(['workload_encoded','datasize_encoded'], axis=1)

    # Remove NaN's remaining
    df_imputed = df_imputed.fillna(-1)
    df_imputed.head()
    return df_imputed
def calculate_run_cost(row):
    instance_type = row['instance']
    elapsed_time = row['elapsed_time']
    
    # Handle potential missing prices or instances:
    try:
        price_per_hour = INSTANCE_PRICES[instance_type]
        price_per_second = price_per_hour / 3600  # Convert hourly price to per-second
        run_cost = price_per_second * elapsed_time
        return run_cost
    except KeyError:
        print(f"Warning: No price found for instance type: {instance_type}")
        return None  # Or handle as you see fit (e.g., fill with mean cost)
def predict_instances(workload, input_size, n):
    """Predicts a set of candidate instances, including new features."""
    try:
        subset = df[df['workload'] == workload]

        workload_input_min = subset['input_size'].min()
        workload_input_max = subset['input_size'].max()
        workload_input_mean = subset['input_size'].mean()
        workload_input_std = subset['input_size'].std()
        utilized_fraction_cpu = subset['utilized_fraction_cpu'].median()
        utilized_fraction_mem = subset['utilized_fraction_mem'].median()
        cpu_headroom = subset['cpu_headroom'].median()
        mem_headroom = subset['mem_headroom'].median()
        cpu_pressure = subset['cpu_pressure'].median()
        mem_pressure = subset['mem_pressure'].median()
        utilized_cpu_mem_ratio = subset['utilized_cpu_mem_ratio'].median()
        capacity_cpu_mem_ratio = subset['capacity_cpu_mem_ratio'].median()

        if workload_input_min != workload_input_max:
            input_size_normalized = (input_size - workload_input_min) / (workload_input_max - workload_input_min)
        else:
            input_size_normalized = 0
        
        input_size_zscore = (input_size - workload_input_mean) / workload_input_std
        # Combine all features into the input data
        input_data = pd.DataFrame({
            'workload_encoded': workload_le.transform([workload]),
            'input_size_normalized': [input_size_normalized],
            'input_size_zscore': [input_size_zscore],
            'utilized_fraction_cpu': [utilized_fraction_cpu],
            'utilized_fraction_mem': [utilized_fraction_mem],
            'cpu_headroom': [cpu_headroom],
            'mem_headroom': [mem_headroom],
            'cpu_pressure': [cpu_pressure],
            'mem_pressure': [mem_pressure],
            'utilized_cpu_mem_ratio': [utilized_cpu_mem_ratio],
            'capacity_cpu_mem_ratio': [capacity_cpu_mem_ratio]
        })

    except Exception as e:
        print(f"Error during input data preparation: {e}. Using default values.") # handles exceptions and uses default values if no data found for the workload
        input_data = pd.DataFrame({
            'workload_encoded': workload_le.transform([workload]), #Use label encoder here too so workload is not a mismatch too
            'input_size_normalized': [0],
            'input_size_zscore': [0],
            'utilized_fraction_cpu': [0],
            'utilized_fraction_mem': [0],
            'cpu_headroom': [0],
            'mem_headroom': [0],
            'cpu_pressure': [0],
            'mem_pressure': [0],
            'utilized_cpu_mem_ratio': [0],
            'capacity_cpu_mem_ratio': [0]
        })

    probabilities = model.predict_proba(input_data)[0]
    top_n_indices = model.classes_[probabilities.argsort()[::-1][:n]] #modified for new instance list
    candidate_instances = instance_le.inverse_transform(top_n_indices)

    return candidate_instances
def predict_best_instance(workload, input_size, n=5):  # Increase n for more candidates
    """Predicts the best instance, handling missing data and edge cases."""

    try:
        candidate_instances = predict_instances(workload, input_size, n)  # Get up to n candidates
        # If predict_instances returns no instances (due to error handling), return immediately
        if candidate_instances is None or len(candidate_instances)==0:
            print(f"No candidate instances found for workload '{workload}'. Returning None.")
            return None
    except Exception as e:
        print(f"Error in predict_instances for workload '{workload}': {e}. Returning None.")
        return None

    best_instance = None
    best_cost = float('inf')

    #Extract workload specific features for efficient input_size normalization.
    workload_input_min = df[df['workload'] == workload]['input_size'].min()
    workload_input_max = df[df['workload'] == workload]['input_size'].max()

    for instance in candidate_instances:
        try:
            # Filter by workload AND instance. Calculate medians for numerical columns only:
            subset = df.loc[(df["instance"] == instance) & (df['workload'] == workload)] #filter dataframe with matching workload and instance type
            datasize_group = subset.groupby('datasize').median(numeric_only=True).reset_index() #numeric_only will ensure that only numerical features will be included for median calculation
            median_elapsed_time, median_run_cost = datasize_group.iloc[(datasize_group["input_size"]-input_size).abs().argsort()[:1]][["elapsed_time", "run_cost"]].values[0] #find closest datasize to the given input_size

        except IndexError: # If there are no matches based on input_size 
            try: #try with closest datasize from all rows with same instance and workload
                datasize_group = subset.groupby('datasize').median().reset_index()
                median_elapsed_time, median_run_cost = datasize_group.iloc[(datasize_group["input_size"] - input_size).abs().argsort()[:1]][
                    ["elapsed_time", "run_cost"]].values[0]
            except IndexError: # If still no match, skip the instance
                continue

        try:
            price_per_hour = INSTANCE_PRICES[instance]
        except KeyError:
            print(f"Warning: No price found for instance type: {instance}")
            continue

        try:
            if workload_input_min != workload_input_max: #normalize time only if input_size varies
                time = (input_size/subset['input_size'].median())*median_elapsed_time #normalization
                cost = (time / 3600) * price_per_hour #cost calculation
            else: #no normalization
                time = median_elapsed_time
                cost = median_run_cost
    
        except:
            print(f"Skipping instance {instance} due to missing cost or time data for workload '{workload}'.")
            continue  # Skip this instance if data is missing

        if cost < best_cost:
            best_cost = cost
            best_instance = instance

    if not best_instance:
        print("Warning: Stage 2 could not predict the best instance due to missing data.")

    return best_instance
def cost_performance_metric(cost, time): 
    max_cost = df['run_cost'].max()
    max_time = df['elapsed_time'].max()

    normalized_cost = cost / max_cost
    normalized_time = time / max_time

    weight_cost = 0.5     # Adjust as needed (0 to 1)
    weight_time = 0.5     # Adjust as needed (0 to 1)

    score = (weight_cost * normalized_cost) + (weight_time * normalized_time)

    return score
df = process_data(path=DATA_PATH)

group_cols = ["workload"]  

group_cols = ['workload', 'program']  # Group by workload and program for imputation
target_cols = ['input_size', 'elapsed_time'] 

df = impute_missing_by_group(df, group_cols, target_cols)
df['run_cost'] = df.apply(calculate_run_cost, axis=1)

workload_datasize_medians = df.groupby(['workload', 'datasize'])[['elapsed_time', 'run_cost']].median().reset_index()
median_lookup = {}
for index, row in workload_datasize_medians.iterrows():
    median_lookup[(row['workload'], row['datasize'])] = (row['elapsed_time'],row['run_cost'])

workload_resource_usage = df.groupby('workload')[['avg_cpu', 'avg_mem', 'avg_disk', 'avg_disk_read', 'avg_disk_write']].median().reset_index()
resource_usage_lookup = {}
for index, row in workload_resource_usage.iterrows():
    resource_usage_lookup[row['workload']] = (row['avg_cpu'],row['avg_mem'],row['avg_disk'],row['avg_disk_read'],row['avg_disk_write'])

workload_cost_efficiency = df.groupby('workload')['elapsed_time'].median() / df.groupby('workload')['run_cost'].median()
workload_cost_efficiency = workload_cost_efficiency.reset_index(name='cost_efficiency')

cost_efficiency_lookup={}
for index, row in workload_cost_efficiency.iterrows():
    cost_efficiency_lookup[row['workload']] = row['cost_efficiency']

df['workload_encoded'] = workload_le.fit_transform(df['workload'])
df['instance_encoded'] = instance_le.fit_transform(df['instance']) #Fit instance_le using all unique instance values

df['input_size_normalized'] = df.groupby('workload')['input_size'].transform(lambda x: MinMaxScaler().fit_transform(x.values.reshape(-1,1)).flatten())
df['input_size_zscore'] = df.groupby('workload')['input_size'].transform(lambda x: StandardScaler().fit_transform(x.values.reshape(-1,1)).flatten())

df.to_csv("./data-checkpoint/feature-engineered.csv", index=False)

X = df[['workload_encoded', "throughput_node", 'input_size_normalized', 'input_size_zscore', 'utilized_fraction_cpu', 'utilized_fraction_mem', 'cpu_headroom', 'mem_headroom', 'cpu_pressure', 'mem_pressure', 'utilized_cpu_mem_ratio', 'capacity_cpu_mem_ratio']]
y = df['instance_encoded']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = XGBClassifier(random_state=42, use_label_encoder=False, eval_metric='mlogloss') 

param_grid = {
    'n_estimators': [50, 100, 200],  # Number of trees
    'max_depth': [3, 5, 7],  # Maximum depth of each tree
    'learning_rate': [0.1, 0.01, 0.001],  # Step size shrinkage used in update to prevents overfitting
    'subsample': [0.8, 1.0],  # Fraction of samples used for fitting the trees
    'colsample_bytree': [0.8, 1.0]  # Fraction of features used for fitting the trees
}

grid_search = GridSearchCV(estimator=model, param_grid=param_grid, scoring='neg_log_loss', cv=5, verbose=1, n_jobs=6)

grid_search.fit(X_train, y_train) # Find the best model parameters
model = grid_search.best_estimator_ #update the model with best estimator
model.fit(X_train, y_train)
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)


costs_true = []      # To store true costs
times_true = []      # To store true elapsed times
costs_predicted = []  # To store predicted costs
times_predicted = []  # To store predicted elapsed times
instances_true = []
instances_predicted = []
cost_reductions = []
performance_changes = []

total_score = 0

df_test = pd.read_csv("./data-checkpoint/feature-engineered.csv")
for index, row in df_test.iterrows():
    true_instance = row['instance']
    predicted_instance = predict_best_instance(row['workload'], row['input_size'])  #Call 2-stage prediction!

    if predicted_instance: # only if there is prediction from stage-1
        # Calculate the actual and predicted cost and throughput
        try:
            elapsed_time_true,run_cost_true = median_lookup[(row['workload'], row['datasize'])]
            #print(elapsed_time)
        except KeyError:
            print(f"No median elapsed time found for workload '{row['workload']}' and instance '{true_instance}'. Skipping.")
            continue  # Or another default value

        time_true = (row['input_size']/df[df.instance == true_instance].input_size.iloc[0]) * elapsed_time_true
        price_per_hour_true = INSTANCE_PRICES[true_instance]
        cost_true = (time_true/3600) * price_per_hour_true

        try:
            elapsed_time_predicted,run_cost_predicted = median_lookup[(row['workload'], row['datasize'])]
        except KeyError:
            print(f"No median elapsed time found for workload '{row['workload']}' and instance '{predicted_instance}'. Skipping.")
            continue  # Or another default value

        time_predicted = (row['input_size']/df[df.instance == predicted_instance].input_size.iloc[0]) * elapsed_time_predicted

        try:
            price_per_hour_predicted = INSTANCE_PRICES[predicted_instance]
        except KeyError:
            print(f"Warning: No price found for instance type: {predicted_instance}")
            continue

        if math.isnan(time_true) or math.isnan(time_predicted) or math.isnan(cost_true) or time_true == 0 or time_predicted == 0 or cost_true == 0:
            continue

        cost_predicted = (time_predicted / 3600) * price_per_hour_predicted
 
        costs_true.append(cost_true)
        times_true.append(time_true)
        costs_predicted.append(cost_predicted)
        times_predicted.append(time_predicted)
        instances_true.append(true_instance)
        instances_predicted.append(predicted_instance)

        true_score = cost_performance_metric(cost_true, time_true)
        predicted_score = cost_performance_metric(cost_predicted, time_predicted)

        total_score += abs(predicted_score - true_score)

        cost_reduction = (cost_true - cost_predicted) / cost_true * 100
        performance_change = (time_true - time_predicted) / time_true * 100

        cost_reductions.append(cost_reduction)
        performance_changes.append(performance_change)

with open('./models/xgb_model.pkl', 'wb') as f:
    pickle.dump(model, f)
with open('./models/workload_le.pkl', 'wb') as f:
    pickle.dump(workload_le, f)
with open('./models/instance_le.pkl', 'wb') as f:
    pickle.dump(instance_le, f)
with open('./models/scaler.pkl', 'wb') as f:
    pickle.dump(scaler, f)

results_df = pd.DataFrame({'true_instance':instances_true,'predicted_instance':instances_predicted,'true_cost': costs_true, 'predicted_cost': costs_predicted, 'true_time': times_true, 'predicted_time': times_predicted})
results_df.to_csv('./results.csv', index=False)