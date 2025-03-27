import redis
import os
import logging

# ----------------------------------------------------------------------------
# CONSTANTS
# ----------------------------------------------------------------------------
LOG_DIRECTORY = r"C:\Users\ARYAVIN\Documents\GitHub\STARTUP\WEB\log"
LOG_FILENAME = 'check_details_redis-2.log'
REDIS_URL = "redis://default:VM3hQnN22dM1sdUNgQZ1kJNyWpmra7gw@redis-18724.c301.ap-south-1-1.ec2.redns.redis-cloud.com:18724"


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
# LIST REDIS KEYS
# ----------------------------------------------------------------------------
def list_redis_keys():
    try:
        client = redis.Redis.from_url(REDIS_URL)
        logging.debug("Connected to Redis successfully.")

        keys = client.keys('*')
        if keys:
            logging.info(f"Total keys found: {len(keys)}")
            print("Keys stored in Redis:")
            for key in keys:
                decoded_key = key.decode('utf-8')
                print(decoded_key)
                logging.info(f"Key: {decoded_key}")
        else:
            print("No keys found in Redis.")
            logging.info("No keys found in Redis.")
    except Exception as e:
        logging.error(f"Error interacting with Redis: {e}")
        print(f"Error: {e}")

# ----------------------------------------------------------------------------
# MAIN EXECUTION
# ----------------------------------------------------------------------------
if __name__ == "__main__":
    setup_logging()
    list_redis_keys()
