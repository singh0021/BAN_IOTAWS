import greengrasssdk
import json

# Greengrass client to publish to
client = greengrasssdk.client('iot-data')

# Executed on every messages received from the subscription (ban1 and ban2 to Lambda)
def lambda_handler(event, context):
  
  # If the data comes from the bans
  if event['device'] in ['ban1','ban2','ban3', 'ban4','ban5','ban6']:
    # Publish to the ban/greengrass/messaging what was received
    client.publish(topic='ban/greengrass/messaging', payload=json.dumps(event))
  else:
    print "Not a valid Ban"
  return
