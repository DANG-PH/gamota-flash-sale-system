from locust import HttpUser, task, constant

class MyUser(HttpUser):
    # Không chờ giữa các request
    wait_time = constant(0)
    # Đặt host trực tiếp (ví dụ server đang chạy)
    host = "https://chrysocarpous-adonis-multilobular.ngrok-free.dev"  # đổi thành địa chỉ API của bạn

    @task
    def post_order(self):
        json_data = {
            "user_id": 123,
            "event_id": 1,
            "quantity": 1
        }
        self.client.post("/ticket/create-order", json=json_data)
