import json
import os
import time
import urllib.request
import urllib.error
from typing import Dict, Any, List
from concurrent.futures import ThreadPoolExecutor, as_completed


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Performs stress test by sending 100 POST requests in 50 parallel threads
    Args: event - dict with httpMethod
          context - object with request_id attribute
    Returns: HTTP response with test results and timing
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method == 'POST':
        target_url = os.environ.get('STRESS_TEST_URL', 'https://functions.poehali.dev/7dd49f13-ce3c-4f24-a52b-0fbe3a998573')
        
        start_time = time.time()
        results = perform_stress_test(target_url, num_requests=100, max_workers=50)
        end_time = time.time()
        
        total_duration = end_time - start_time
        
        successful = sum(1 for r in results if r['success'])
        failed = len(results) - successful
        
        avg_response_time = sum(r['duration'] for r in results if r['success']) / max(successful, 1)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({
                'total_duration_seconds': round(total_duration, 3),
                'total_requests': len(results),
                'successful_requests': successful,
                'failed_requests': failed,
                'average_response_time_ms': round(avg_response_time * 1000, 2),
                'requests_per_second': round(len(results) / total_duration, 2),
                'target_url': target_url,
                'request_id': context.request_id
            })
        }
    
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }


def perform_stress_test(url: str, num_requests: int = 100, max_workers: int = 50) -> List[Dict[str, Any]]:
    results = []
    
    def make_request(request_num: int) -> Dict[str, Any]:
        start = time.time()
        try:
            req = urllib.request.Request(
                url,
                method='POST',
                headers={
                    'Content-Type': 'application/json'
                },
                data=b''
            )
            with urllib.request.urlopen(req, timeout=30) as response:
                status_code = response.status
                duration = time.time() - start
                return {
                    'request_num': request_num,
                    'success': True,
                    'status_code': status_code,
                    'duration': duration
                }
        except urllib.error.HTTPError as e:
            duration = time.time() - start
            return {
                'request_num': request_num,
                'success': False,
                'status_code': e.code,
                'duration': duration,
                'error': str(e)
            }
        except Exception as e:
            duration = time.time() - start
            return {
                'request_num': request_num,
                'success': False,
                'status_code': 0,
                'duration': duration,
                'error': str(e)
            }
    
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = [executor.submit(make_request, i) for i in range(num_requests)]
        for future in as_completed(futures):
            results.append(future.result())
    
    return results