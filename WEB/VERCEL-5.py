import os
import logging
import requests
import json

# ----------------------------------------------------------------------------
# CONSTANTS
# ----------------------------------------------------------------------------
BASE_URL = "https://api.vercel.com"
VERCEL_TOKEN = "EHrL5NzXYnGSA6xmIJqV2E7b"
LOG_DIRECTORY = r"C:\Users\ARYAVIN\Documents\REPO\STARTUP\WEB\log"
LOG_FILENAME = "vercel_5.log"
REPO_ID = 948498869
BRANCH = 'main'
PROJECT_NAME = 'startup'  # ✅ Correct name from your Vercel dashboard

# ----------------------------------------------------------------------------
# LOGGING SETUP
# ----------------------------------------------------------------------------
def setup_logging():
    try:
        os.makedirs(LOG_DIRECTORY, exist_ok=True)
        logging.basicConfig(
            level=logging.DEBUG,
            format='%(asctime)s - %(levelname)s - %(message)s',
            filename=os.path.join(LOG_DIRECTORY, LOG_FILENAME),
            filemode='w'
        )
        logging.debug("Logging setup completed.")
    except Exception as e:
        print(f"Failed to setup logging: {e}")
        raise

# ----------------------------------------------------------------------------
# DEPLOY FUNCTION
# ----------------------------------------------------------------------------
def deploy_from_git():
    setup_logging()
    url = f"{BASE_URL}/v13/deployments"

    headers = {
        'Authorization': f'Bearer {VERCEL_TOKEN}',
        'Content-Type': 'application/json'
    }

    payload = {
        "name": PROJECT_NAME,  # startup
        "gitSource": {
            "type": "github",
            "repoId": REPO_ID,
            "ref": BRANCH
        },
        "target": "production"
    }

    response = requests.post(url, headers=headers, data=json.dumps(payload))

    if response.status_code in [200, 201]:
        deploy_url = response.json().get('url')
        logging.info(f"Deployment started! URL: https://{deploy_url}")
        print(f"\n✅ Deployment started! URL: https://{deploy_url}\n")
    else:
        logging.error(f"Deployment failed! Status: {response.status_code} Response: {response.text}")
        print("\n❌ Deployment failed!")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}\n")

# ----------------------------------------------------------------------------
# EXECUTION
# ----------------------------------------------------------------------------
if __name__ == "__main__":
    deploy_from_git()
