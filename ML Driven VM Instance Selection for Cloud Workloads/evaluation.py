import pickle
import numpy as np
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, mean_squared_error, mean_absolute_error, r2_score, mean_absolute_percentage_error, classification_report 
from sklearn.model_selection import train_test_split, cross_val_score, KFold

df = pd.read_csv('./data-checkpoint/feature-engineered.csv')
results_df = pd.read_csv('./data-checkpoint/results.csv')

X = df[['workload_encoded', 'input_size_normalized', 'input_size_zscore', 'utilized_fraction_cpu', 'utilized_fraction_mem', 'cpu_headroom', 'mem_headroom', 'cpu_pressure', 'mem_pressure', 'utilized_cpu_mem_ratio', 'capacity_cpu_mem_ratio']]
y = df['instance_encoded']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

with open('./models/xgb_model.pkl', 'rb') as f:
    model = pickle.load(f)
with open('./models/workload_le.pkl', 'rb') as f:
    workload_le = pickle.load(f)
with open('./models/instance_le.pkl', 'rb') as f:  # Load the instance LabelEncoder
    instance_le = pickle.load(f)
with open('./models/scaler.pkl', 'rb') as f:  # Load the StandardScaler
    scaler = pickle.load(f)

def evaluate_cost(results_df):
    """Evaluates cost-related metrics."""

    # Calculate average costs
    average_cost_true = results_df['true_cost'].mean()
    average_cost_predicted = results_df['predicted_cost'].mean()
    
    # Calculate Cost Savings Percentage
    try: # Handle potential division by zero if true cost is zero
        cost_savings_percentage = (average_cost_true - average_cost_predicted) / average_cost_true * 100
    except ZeroDivisionError:
        cost_savings_percentage = float('inf')  # Or handle as appropriate (e.g., 0)

    # Cumulative Cost Distribution
    costs_true = np.sort(results_df['true_cost'])
    costs_predicted = np.sort(results_df['predicted_cost'])

    cdf_true = np.arange(1, len(costs_true) + 1) / len(costs_true)  
    cdf_predicted = np.arange(1, len(costs_predicted) + 1) / len(costs_predicted)

    plt.figure(figsize=(8, 6))  # Adjust figure size as needed
    plt.plot(costs_true, cdf_true, label='True Costs')
    plt.plot(costs_predicted, cdf_predicted, label='Predicted Costs')
    plt.xlabel('Cost')
    plt.ylabel('Cumulative Probability')
    plt.title('Cumulative Distribution of Costs')
    plt.legend()
    plt.grid(True)
    plt.show()  # Or plt.savefig() to save the plot

    return average_cost_true, average_cost_predicted, cost_savings_percentage


avg_true_cost, avg_predicted_cost, cost_savings_perc = evaluate_cost(results_df)

print(f"Average True Cost: {avg_true_cost}")
print(f"Average Predicted Cost: {avg_predicted_cost}")
print(f"Cost Savings Percentage: {cost_savings_perc:.2f}%")  

def evaluate_performance(results_df):
    """Evaluates performance-related metrics."""

    # Calculate average times
    average_time_true = results_df['true_time'].mean()
    average_time_predicted = results_df['predicted_time'].mean()

    # Calculate Time Increase/Decrease Percentage
    time_change_percentage = (average_time_true - average_time_predicted) / average_time_true * 100

    # Cumulative Time Distribution
    times_true = np.sort(results_df['true_time'])
    times_predicted = np.sort(results_df['predicted_time'])
    cdf_true = np.arange(1, len(times_true) + 1) / len(times_true)
    cdf_predicted = np.arange(1, len(times_predicted) + 1) / len(times_predicted)

    plt.figure(figsize=(8, 6))  # Adjust figure size as needed
    plt.plot(times_true, cdf_true, label='True Times')
    plt.plot(times_predicted, cdf_predicted, label='Predicted Times')
    plt.xlabel('Elapsed Time')
    plt.ylabel('Cumulative Probability')
    plt.title('Cumulative Distribution of Elapsed Times')
    plt.legend()
    plt.grid(True)
    plt.show()

    # Scatter Plot (Cost vs. Time)
    plt.figure(figsize=(8, 6)) #Adjust figure size as needed
    plt.scatter(results_df['true_cost'], results_df['true_time'], label='True Instances', alpha=0.5)  # Alpha for transparency
    plt.scatter(results_df['predicted_cost'], results_df['predicted_time'], label='Predicted Instances', alpha=0.5)
    plt.xlabel('Cost')
    plt.ylabel('Elapsed Time')
    plt.title('Cost vs. Elapsed Time Scatter Plot')
    plt.legend()
    plt.grid(True)
    plt.show()

    return average_time_true, average_time_predicted, time_change_percentage


avg_true_time, avg_predicted_time, time_change_perc = evaluate_performance(results_df)

print(f"Average True Time: {avg_true_time}")
print(f"Average Predicted Time: {avg_predicted_time}")
print(f"Time Change Percentage: {time_change_perc:.2f}%")

def evaluate_accuracy(y_true, y_pred, instance_le, k=5):  # Include instance_le and k
    """
    Evaluates accuracy metrics for the instance type prediction model.
    
    Args:
        y_true: True instance type encodings (NumPy array or list).
        y_pred: Predicted instance type encodings (NumPy array or list).
        instance_le: Fitted LabelEncoder for instance types.
        k (int):  Value for Top-k accuracy.

    Returns:
        Tuple: Accuracy, top-k accuracy, classification report string, confusion matrix.
    """
    try:
        accuracy = accuracy_score(y_true, y_pred)


        # Top-k accuracy (decode labels first)
        y_true_decoded = instance_le.inverse_transform(y_true)
        y_pred_topk = np.argsort(model.predict_proba(X_test), axis=1)[:, -k:]
        y_pred_topk_decoded = [instance_le.inverse_transform(pred) for pred in y_pred_topk]
        top_k_acc = np.mean([true_instance in predicted_instances for true_instance, predicted_instances in zip(y_true_decoded, y_pred_topk_decoded)])


        # Classification report (decode labels first)
        y_pred_decoded = instance_le.inverse_transform(y_pred)  # Decode for report
        print(y_true_decoded)
        print(y_pred_decoded)
        report = classification_report(y_true_decoded, y_pred_decoded)

        # Confusion matrix (decode labels first)
        cm = confusion_matrix(y_true_decoded, y_pred_decoded, labels=instance_le.classes_) # Pass labels for sorting

    except Exception as e:
        print(f"Error calculating accuracy metrics: {e}")
        return None,None,None,None #handle cases where some metrics are unavailable.
    
    return accuracy, top_k_acc, report, cm

# After model training and prediction:
y_pred = model.predict(X_test)  # Assuming X_test is available

accuracy, top_k_accuracy, clf_report, cm = evaluate_accuracy(y_test, y_pred, instance_le)

print(f"Accuracy: {accuracy:.4f}")       # Formatted to four decimal places
print(f"Top-{5} Accuracy: {top_k_accuracy:.4f}") # Formatted to four decimal places
print("\nClassification Report:\n", clf_report)

# Plot the confusion matrix using seaborn for better visualization
plt.figure(figsize=(10, 8))  # Adjust figure size if needed
sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", xticklabels=instance_le.classes_, yticklabels=instance_le.classes_) # Added labels
plt.xlabel('Predicted Instance')
plt.ylabel('True Instance')
plt.title('Confusion Matrix')
plt.show()

def cost_performance_metric(cost, time): 
    max_cost = df['run_cost'].max()
    max_time = df['elapsed_time'].max()

    normalized_cost = cost / max_cost
    normalized_time = time / max_time

    weight_cost = 0.5     # Adjust as needed (0 to 1)
    weight_time = 0.5     # Adjust as needed (0 to 1)

    score = (weight_cost * normalized_cost) + (weight_time * normalized_time)

    return score

rmse_cost = mean_squared_error(results_df['true_cost'], results_df['predicted_cost'], squared=False)  # RMSE
mean_cost_diff = np.mean(np.abs(results_df['true_cost'] - results_df['predicted_cost']))
r2_cost = r2_score(results_df['true_cost'], results_df['predicted_cost'])

# b. Time Metrics
rmse_time = mean_squared_error(results_df['true_time'], results_df['predicted_time'], squared=False)
mean_time_diff = np.mean(np.abs(results_df['true_time'] - results_df['predicted_time']))
r2_time = r2_score(results_df['true_time'], results_df['predicted_time'])

# c. Combined Cost-Performance Metric (using your function)
results_df['true_score'] = results_df.apply(lambda row: cost_performance_metric(row['true_cost'], row['true_time']), axis=1)
results_df['predicted_score'] = results_df.apply(lambda row: cost_performance_metric(row['predicted_cost'], row['predicted_time']), axis=1)
mean_score_diff = np.mean(np.abs(results_df['true_score'] - results_df['predicted_score']))

# d. Cross-validation (example using RMSE for cost as the metric)
cv = KFold(n_splits=5, shuffle=True, random_state=42)
X_cv = X # use entire X
y_cv = y # Use entire y
scores = cross_val_score(model, X_cv, y_cv, scoring='neg_root_mean_squared_error', cv=cv, n_jobs=-1)
cv_rmse = -np.mean(scores)


# 6. Print the results
print("Evaluation Metrics:")
print(f"RMSE Cost: {rmse_cost}")
print(f"Mean Cost Difference: {mean_cost_diff}")
print(f"R-squared Cost: {r2_cost}")
print(f"RMSE Time: {rmse_time}")
print(f"Mean Time Difference: {mean_time_diff}")
print(f"R-squared Time: {r2_time}")
print(f"Mean Score Difference: {mean_score_diff}")
print(f"Cross-validated RMSE: {cv_rmse}")

y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred, average='weighted') # 'weighted' for multi-class
recall = recall_score(y_test, y_pred, average='weighted')
f1 = f1_score(y_test, y_pred, average='weighted')
mse = mean_squared_error(y_test, y_pred)
mae = mean_absolute_error(y_test, y_pred)
rmse = np.sqrt(mse)
mape = mean_absolute_percentage_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print(f"Accuracy: {accuracy}")
print(f"Precision: {precision}")
print(f"Recall: {recall}")
print(f"F1-score: {f1}")
print(f"Mean Squared Error: {mse}")
print(f"Mean Absolute Error: {mae}")
print(f"R-squared: {r2}")
print(f"Mean Absolute Percentage Error: {mape}")
print(f"Root Mean Squared Error: {rmse}")

plt.figure(figsize=(10, 7)) # adjust size
sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", 
            xticklabels=instance_le.inverse_transform(model.classes_), # decode labels
            yticklabels=instance_le.inverse_transform(model.classes_))
plt.xlabel("Predicted Instance")
plt.ylabel("True Instance")
plt.title("Confusion Matrix")
plt.show()


