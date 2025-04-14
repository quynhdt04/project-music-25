# from django.shortcuts import render
# from django.http import JsonResponse
# from django.views.decorators.csrf import csrf_exempt
# from models.
# import json
# from django.utils import timezone
# from django.contrib.auth.models import User  # Nếu bạn cần User

# @csrf_exempt
# def payment_success_callback(request):
#     if request.method == 'POST':
#         try:
#             data = json.loads(request.body)
#             # ... (trích xuất dữ liệu)
#             try:
#                 # ... (lấy User nếu cần)
#                 payment = Payment(
#                     user=user,
#                     order_id=order_id,
#                     transaction_id=transaction_id,
#                     payment_method=payment_method,
#                     payment_gateway=payment_gateway,
#                     amount=amount,
#                     currency=currency,
#                     transaction_date=timezone.now(),
#                     gateway_response=gateway_response
#                 )
#                 payment.save()
#                 return JsonResponse({'message': 'Payment information saved successfully'}, status=200)
#             except Exception as e:
#                 return JsonResponse({'error': f'Error saving payment: {e}'}, status=500)
#         except Exception as e:
#             return JsonResponse({'error': f'Error processing callback: {e}'}, status=400)
#     else:
#         return JsonResponse({'error': 'Invalid method'}, status=405)