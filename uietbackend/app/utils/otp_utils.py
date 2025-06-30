# app/utils/otp_utils.py
import random
import string

def generate_otp(length=6):
    chars = string.ascii_uppercase + string.digits
    return ''.join(random.choices(chars, k=length))
