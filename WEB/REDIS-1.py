import redis

# Connect to Redis Cloud
r = redis.Redis.from_url(
    "redis://default:VM3hQnN22dM1sdUNgQZ1kJNyWpmra7gw@redis-18724.c301.ap-south-1-1.ec2.redns.redis-cloud.com:18724"
)

# Test write
success = r.set("foo", "bar")
print("Write Success:", success)  # Expected: True

# Test read
result = r.get("foo")
print("Read Value:", result.decode())  # Expected: bar
