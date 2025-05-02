import hashlib
import hmac
import json
import urllib
import urllib.parse
import urllib.request
import random
import requests
from datetime import datetime, timedelta
from django.conf import settings
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render, redirect
from urllib.parse import quote
from models.payment import PaymentForm  
from models.vnpay import vnpay
from models.user import User  # Import the User model
from models.pricingPlan import PricingPlan  # Import the PricingPlan model
from bson import ObjectId  # Import ObjectId for MongoDB
from django.views.decorators.csrf import csrf_exempt
import traceback 


def get_user_id_from_request(request):
    # Lấy user_id từ header
    user_id = request.headers.get('User-Id')
    if not user_id:
        # Nếu không tìm thấy user_id trong header, trả về lỗi
        raise ValueError("User ID không hợp lệ.")
    return int(user_id)

def index(request):
    return render(request, "index.html", {"title": "Danh sách demo"})


def hmacsha512(key, data):
    byteKey = key.encode('utf-8')
    byteData = data.encode('utf-8')
    return hmac.new(byteKey, byteData, hashlib.sha512).hexdigest()

@csrf_exempt
def payment(request):
    if request.method == 'POST':
        try:
            # Lấy dữ liệu từ body của request
            data = json.loads(request.body.decode('utf-8'))
            form = PaymentForm(data)  # Truyền dữ liệu vào form

            if form.is_valid():
                # Tiến hành xử lý và redirect
                order_type = form.cleaned_data['order_type']
                order_id = form.cleaned_data['order_id']
                amount = form.cleaned_data['amount']
                order_desc = form.cleaned_data['order_desc']
                bank_code = form.cleaned_data['bank_code']
                language = form.cleaned_data['language']
                ipaddr = get_client_ip(request)
                vnp = vnpay()
                # Xử lý các tham số thanh toán từ form
                vnp.requestData['vnp_Version'] = '2.1.0'
                vnp.requestData['vnp_Command'] = 'pay'
                vnp.requestData['vnp_TmnCode'] = settings.VNPAY_TMN_CODE
                vnp.requestData['vnp_Amount'] = amount * 100
                vnp.requestData['vnp_CurrCode'] = 'VND'
                vnp.requestData['vnp_TxnRef'] = order_id
                vnp.requestData['vnp_OrderInfo'] = order_desc
                vnp.requestData['vnp_OrderType'] = order_type
                if language:
                    vnp.requestData['vnp_Locale'] = language
                else:
                    vnp.requestData['vnp_Locale'] = 'vn'
                if bank_code:
                    vnp.requestData['vnp_BankCode'] = bank_code
                vnp.requestData['vnp_CreateDate'] = datetime.now().strftime('%Y%m%d%H%M%S')
                vnp.requestData['vnp_IpAddr'] = ipaddr
                vnp.requestData['vnp_ReturnUrl'] = settings.VNPAY_RETURN_URL
                vnpay_payment_url = vnp.get_payment_url(settings.VNPAY_PAYMENT_URL, settings.VNPAY_HASH_SECRET_KEY)
                return JsonResponse({'code': '00', 'data': vnpay_payment_url})
            else:
                return JsonResponse({'code': '01', 'Message': 'Form không hợp lệ', 'errors': form.errors})
        except json.JSONDecodeError:
            return JsonResponse({'code': '01', 'Message': 'Dữ liệu không hợp lệ'})
    else:
        return JsonResponse({'code': '01', 'Message': 'Chỉ hỗ trợ phương thức POST'})
def payment_ipn(request):
    inputData = request.GET
    if inputData:
        vnp = vnpay()
        vnp.responseData = inputData.dict()
        order_id = inputData['vnp_TxnRef']
        amount = inputData['vnp_Amount']
        order_desc = inputData['vnp_OrderInfo']
        vnp_TransactionNo = inputData['vnp_TransactionNo']
        vnp_ResponseCode = inputData['vnp_ResponseCode']
        vnp_TmnCode = inputData['vnp_TmnCode']
        vnp_PayDate = inputData['vnp_PayDate']
        vnp_BankCode = inputData['vnp_BankCode']
        vnp_CardType = inputData['vnp_CardType']
        if vnp.validate_response(settings.VNPAY_HASH_SECRET_KEY):
            # Check & Update Order Status in your Database
            # Your code here
            firstTimeUpdate = True
            totalamount = True
            if totalamount:
                if firstTimeUpdate:
                    if vnp_ResponseCode == '00':
                        print('Payment Success. Your code implement here')
                    else:
                        print('Payment Error. Your code implement here')

                    # Return VNPAY: Merchant update success
                    result = JsonResponse({'RspCode': '00', 'Message': 'Confirm Success'})
                else:
                    # Already Update
                    result = JsonResponse({'RspCode': '02', 'Message': 'Order Already Update'})
            else:
                # invalid amount
                result = JsonResponse({'RspCode': '04', 'Message': 'invalid amount'})
        else:
            # Invalid Signature
            result = JsonResponse({'RspCode': '97', 'Message': 'Invalid Signature'})
    else:
        result = JsonResponse({'RspCode': '99', 'Message': 'Invalid request'})

    return result

@csrf_exempt
def payment_return(request):
    if request.method == "POST":
        try:
            body_unicode = request.body.decode('utf-8')
            body = json.loads(body_unicode)

            print("✅ POST BODY:", body)

            user_id = body.get("user_id")
            order_id = body.get("order_id")
            amount = int(body.get("amount")) // 100
            order_desc = body.get("order_desc")
            vnp_TransactionNo = body.get("vnp_TransactionNo")
            vnp_ResponseCode = body.get("vnp_ResponseCode")
            msg = body.get("msg")

            # Mapping số tiền -> duration
            def get_duration_from_amount(amount):
                amount = int(amount)
                if amount == 40000:
                    return 30
                elif amount == 200000:
                    return 180
                elif amount == 350000:
                    return 365
                else:
                    return 0 # Hoặc có thể raise Exception nếu không tìm thấy
            duration = get_duration_from_amount(amount)
            status = "thanh_cong" if vnp_ResponseCode == "00" else "that_bai"

            if status == "thanh_cong":
                try:
                    user = User.objects.get(id=user_id)

                    now = datetime.utcnow()

                    # Nếu user đã có premium và chưa hết hạn → cộng thêm vào ngày hiện tại
                    if user.isPremium and user.premiumExpiresAt and user.premiumExpiresAt > now:
                        user.premiumExpiresAt += timedelta(days=duration)
                    else:
                        # Nếu chưa từng Premium hoặc đã hết hạn → đặt lại từ hôm nay
                        user.premiumExpiresAt = now + timedelta(days=duration)

                    user.isPremium = True  # ✅ Luôn bật isPremium khi thanh toán thành công
                    user.save()

                    print("✅ Đã cập nhật Premium:", user.isPremium, user.premiumExpiresAt)

                except User.DoesNotExist:
                    print("❌ Không tìm thấy user khi cập nhật Premium")

            print("🧾 Saving to DB with:", user_id, order_id, amount, "duration:", duration)
            # Lưu thông tin vào MongoDB
            pricing_plan = PricingPlan(
                user_id=user_id,
                order_id=order_id,
                order_type="VNPAY",
                amount=amount,
                order_desc=order_desc,
                bank_code="",  # Nếu bạn không có từ frontend
                language="vi",
                status=status,
                duration=duration,  # Thời gian sử dụng gói cước (ngày)
                createdAt=datetime.utcnow(),
                updatedAt=datetime.utcnow(),
            )
            pricing_plan.save()
             # Cập nhật isPremium cho user
            user = User.objects.get(id=user_id)
            user.isPremium = True  # Cập nhật là Premium
            user.save()

            print(f"User {user_id} đã được cập nhật là Premium")

            return JsonResponse({"code": "00", "message": "Lưu thanh toán thành công"})
        except Exception as e:
            print("❌ Exception khi lưu thanh toán:")
            traceback.print_exc()  # In toàn bộ lỗi chi tiết ra terminal
            return JsonResponse({"code": "01", "message": f"Lỗi: {str(e)}"}, status=500)
    
    return JsonResponse({"code": "01", "message": "Phương thức không hợp lệ"}, status=405)

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

n = random.randint(10**11, 10**12 - 1)
n_str = str(n)
while len(n_str) < 12:
    n_str = '0' + n_str


def query(request):
    if request.method == 'GET':
        return render(request, "query.html", {"title": "Kiểm tra kết quả giao dịch"})

    url = settings.VNPAY_API_URL
    secret_key = settings.VNPAY_HASH_SECRET_KEY
    vnp_TmnCode = settings.VNPAY_TMN_CODE
    vnp_Version = '2.1.0'

    vnp_RequestId = n_str
    vnp_Command = 'querydr'
    vnp_TxnRef = request.POST['order_id']
    vnp_OrderInfo = 'kiem tra gd'
    vnp_TransactionDate = request.POST['trans_date']
    vnp_CreateDate = datetime.now().strftime('%Y%m%d%H%M%S')
    vnp_IpAddr = get_client_ip(request)

    hash_data = "|".join([
        vnp_RequestId, vnp_Version, vnp_Command, vnp_TmnCode,
        vnp_TxnRef, vnp_TransactionDate, vnp_CreateDate,
        vnp_IpAddr, vnp_OrderInfo
    ])

    secure_hash = hmac.new(secret_key.encode(), hash_data.encode(), hashlib.sha512).hexdigest()

    data = {
        "vnp_RequestId": vnp_RequestId,
        "vnp_TmnCode": vnp_TmnCode,
        "vnp_Command": vnp_Command,
        "vnp_TxnRef": vnp_TxnRef,
        "vnp_OrderInfo": vnp_OrderInfo,
        "vnp_TransactionDate": vnp_TransactionDate,
        "vnp_CreateDate": vnp_CreateDate,
        "vnp_IpAddr": vnp_IpAddr,
        "vnp_Version": vnp_Version,
        "vnp_SecureHash": secure_hash
    }

    headers = {"Content-Type": "application/json"}

    response = requests.post(url, headers=headers, data=json.dumps(data))

    if response.status_code == 200:
        response_json = json.loads(response.text)
    else:
        response_json = {"error": f"Request failed with status code: {response.status_code}"}

    return render(request, "query.html", {"title": "Kiểm tra kết quả giao dịch", "response_json": response_json})

def refund(request):
    if request.method == 'GET':
        return render(request, "refund.html", {"title": "Hoàn tiền giao dịch"})

    url = settings.VNPAY_API_URL
    secret_key = settings.VNPAY_HASH_SECRET_KEY
    vnp_TmnCode = settings.VNPAY_TMN_CODE
    vnp_RequestId = n_str
    vnp_Version = '2.1.0'
    vnp_Command = 'refund'
    vnp_TransactionType = request.POST['TransactionType']
    vnp_TxnRef = request.POST['order_id']
    vnp_Amount = request.POST['amount']
    vnp_OrderInfo = request.POST['order_desc']
    vnp_TransactionNo = '0'
    vnp_TransactionDate = request.POST['trans_date']
    vnp_CreateDate = datetime.now().strftime('%Y%m%d%H%M%S')
    vnp_CreateBy = 'user01'
    vnp_IpAddr = get_client_ip(request)

    hash_data = "|".join([
        vnp_RequestId, vnp_Version, vnp_Command, vnp_TmnCode, vnp_TransactionType, vnp_TxnRef,
        vnp_Amount, vnp_TransactionNo, vnp_TransactionDate, vnp_CreateBy, vnp_CreateDate,
        vnp_IpAddr, vnp_OrderInfo
    ])

    secure_hash = hmac.new(secret_key.encode(), hash_data.encode(), hashlib.sha512).hexdigest()

    data = {
        "vnp_RequestId": vnp_RequestId,
        "vnp_TmnCode": vnp_TmnCode,
        "vnp_Command": vnp_Command,
        "vnp_TxnRef": vnp_TxnRef,
        "vnp_Amount": vnp_Amount,
        "vnp_OrderInfo": vnp_OrderInfo,
        "vnp_TransactionDate": vnp_TransactionDate,
        "vnp_CreateDate": vnp_CreateDate,
        "vnp_IpAddr": vnp_IpAddr,
        "vnp_TransactionType": vnp_TransactionType,
        "vnp_TransactionNo": vnp_TransactionNo,
        "vnp_CreateBy": vnp_CreateBy,
        "vnp_Version": vnp_Version,
        "vnp_SecureHash": secure_hash
    }

    headers = {"Content-Type": "application/json"}

    response = requests.post(url, headers=headers, data=json.dumps(data))

    if response.status_code == 200:
        response_json = json.loads(response.text)
    else:
        response_json = {"error": f"Request failed with status code: {response.status_code}"}

    return render(request, "refund.html", {"title": "Kết quả hoàn tiền giao dịch", "response_json": response_json})

def check_and_update_user_premium(user):
    if user.premiumExpiresAt and user.premiumExpiresAt < datetime.utcnow():
        user.isPremium = False
        user.premiumExpiresAt = None
        user.save()

