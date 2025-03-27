import redis
import os
import logging
import bcrypt

# ----------------------------------------------------------------------------
# CONSTANTS
# ----------------------------------------------------------------------------
LOG_DIRECTORY = r"C:\Users\ARYAVIN\Documents\GitHub\STARTUP\WEB\log"
LOG_FILENAME = 'register_user_redis.log'
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
# HASH PASSWORD
# ----------------------------------------------------------------------------
def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

# ----------------------------------------------------------------------------
# REGISTER USER FUNCTION
# ----------------------------------------------------------------------------
def register_user(email, password):
    try:
        client = redis.Redis.from_url(REDIS_URL)
        logging.debug("Connected to Redis successfully.")

        user_key = f"user:{email}"

        if client.exists(user_key):
            print("Email already registered. Please log in.")
            logging.info(f"Duplicate signup attempt: {email}")
        else:
            hashed_pw = hash_password(password)
            client.hset(user_key, mapping={"email": email, "password": hashed_pw})
            print("User registered successfully.")
            logging.info(f"New user registered: {email}")
    except Exception as e:
        logging.error(f"Error during registration: {e}")
        print(f"Error: {e}")

# ----------------------------------------------------------------------------
# MAIN EXECUTION
# ----------------------------------------------------------------------------
if __name__ == "__main__":
    setup_logging()
    # Simulate user input (replace with actual inputs if needed)
    email_input = "vny.aryan@gmail.com"
    password_input = "SecurePass123"

    register_user(email_input, password_input)
