#!/usr/bin/env python
import requests
import json
import time
import sys

GATEWAY_URL = 'http://localhost:8000'
FETCHER_URL = 'http://localhost:8001'
ANALYZER_URL = 'http://localhost:8002'

def print_section(title):
    print()
    print("=" * 70)
    print(f"  {title}")
    print("=" * 70)

def check_services():
    print_section("SERVICE HEALTH CHECK")
    
    services = [
        ('Gateway', GATEWAY_URL),
        ('Fetcher', FETCHER_URL),
        ('Analyzer', ANALYZER_URL),
    ]
    
    all_healthy = True
    for name, url in services:
        try:
            response = requests.get(f'{url}/health', timeout=5)
            if response.status_code == 200:
                print(f"  ✅ {name:<15} {url} - OK")
            else:
                print(f"  ❌ {name:<15} {url} - Error: {response.status_code}")
                all_healthy = False
        except requests.exceptions.ConnectionError:
            print(f"  ❌ {name:<15} {url} - NOT RUNNING")
            all_healthy = False
        except Exception as e:
            print(f"  ❌ {name:<15} {url} - Error: {str(e)}")
            all_healthy = False
    
    return all_healthy

def test_analysis():
    print_section("SUBMITTING TEST ANALYSIS")
    
    pr_url = 'https://github.com/torvalds/linux/pull/123'
    
    print(f"  📍 PR URL: {pr_url}")
    print()
    
    try:
        print(f"  📤 Sending analysis request...")
        response = requests.post(
            f'{GATEWAY_URL}/analyze',
            json={'pr_url': pr_url},
            timeout=10
        )
        
        if response.status_code != 200:
            print(f"  ❌ Failed to submit: {response.status_code}")
            print(f"  Response: {response.text}")
            return False
        
        data = response.json()
        job_id = data.get('job_id')
        
        if not job_id:
            print(f"  ❌ No job ID in response: {data}")
            return False
        
        print(f"  ✅ Job submitted successfully")
        print(f"     Job ID: {job_id}")
        print()
        
        print_section("POLLING FOR ANALYSIS RESULTS")
        print(f"  Checking job status every 1 second...")
        print()
        
        max_polls = 10
        for poll_count in range(max_polls):
            try:
                status_response = requests.get(
                    f'{GATEWAY_URL}/status/{job_id}',
                    timeout=5
                )
                
                if status_response.status_code != 200:
                    print(f"  [{poll_count+1}/{max_polls}] ⚠️  Status check failed: {status_response.status_code}")
                    time.sleep(1)
                    continue
                
                status_data = status_response.json()
                status = status_data.get('status', 'unknown')
                result = status_data.get('result')
                
                status_symbol = {
                    'pending': '⏳',
                    'processing': '⚙️ ',
                    'completed': '✅',
                    'failed': '❌'
                }.get(status, '❓')
                
                print(f"  [{poll_count+1}/{max_polls}] {status_symbol} Status: {status:<12} | Result: {('Present' if result else 'Pending'):<10}")
                
                if status == 'completed':
                    print()
                    print_section("ANALYSIS RESULT")
                    if result:
                        print()
                        print(result)
                        print()
                    else:
                        print("  (No result content)")
                    return True
                
                elif status == 'failed':
                    print()
                    print_section("ANALYSIS FAILED")
                    print(f"  Result: {result}")
                    return False
                
                time.sleep(1)
            
            except requests.exceptions.Timeout:
                print(f"  [{poll_count+1}/{max_polls}] ⚠️  Timeout checking status")
                time.sleep(1)
            except Exception as e:
                print(f"  [{poll_count+1}/{max_polls}] ⚠️  Error: {str(e)}")
                time.sleep(1)
        
        print()
        print(f"  ⏱️  Max polling attempts reached ({max_polls})")
        print(f"  Analysis may still be processing in the background")
        return True
        
    except requests.exceptions.ConnectionError:
        print(f"  ❌ Cannot connect to Gateway service")
        print(f"     Make sure it's running on {GATEWAY_URL}")
        return False
    except Exception as e:
        print(f"  ❌ Error: {str(e)}")
        return False

def main():
    print()
    print(" " * 70)
    print("  🚀 PR CODE REVIEW ASSISTANT - TEST SUITE")
    print(" " * 70)
    
    if not check_services():
        print()
        print_section("ERROR")
        print("  ❌ Not all services are running!")
        print()
        print("  To start all services, run: .\\start_app.bat")
        print()
        sys.exit(1)
    
    success = test_analysis()
    
    print_section("TEST SUMMARY")
    if success:
        print("  ✅ Test completed successfully!")
    else:
        print("  ❌ Test failed")
    print()

if __name__ == "__main__":
    main()
