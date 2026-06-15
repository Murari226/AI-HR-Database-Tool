from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
app = FastAPI()
import os

client = MongoClient(
    os.getenv("MONGO_URL")
)
db = client["hr_database"]

employees_collection = db["employees"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
employees = [
    {
        "id": 1,
        "name": "John",
        "department": "HR",
        "salary": 80000,
        "status": "Active"
    },
    {
        "id": 2,
        "name": "Murari",
        "department": "AI",
        "salary": 100000,
        "status": "Active"
    }
]

@app.get("/")
def home():
    return {"message": "HR API Running Successfully"}
@app.get("/employees")
def get_employees():

    employees = list(
        employees_collection.find(
            {},
            {"_id": 0}
        )
    )

    return employees


@app.post("/employees")
def add_employee(employee: dict):

    employees_collection.insert_one(employee)

    return {
        "message": "Employee saved to MongoDB"
    }
@app.delete("/employees/{employee_id}")
def delete_employee(employee_id: int):

    result = employees_collection.delete_one(
        {"id": employee_id}
    )

    return {
        "deleted_count": result.deleted_count
    }
@app.put("/employees/{employee_id}")
def update_employee(employee_id: int, employee: dict):

    employees_collection.update_one(
        {"id": employee_id},
        {"$set": employee}
    )

    return {
        "message": "Employee updated"
    }           
@app.get("/stats")
def get_stats():

    employees = list(
        employees_collection.find(
            {},
            {"_id": 0}
        )
    )

    total_employees = len(employees)

    active_employees = len(
        [
            emp
            for emp in employees
            if emp["status"] == "Active"
        ]
    )

    average_salary = (
        sum(
            emp["salary"]
            for emp in employees
        ) / total_employees
        if total_employees > 0
        else 0
    )

    departments = len(
        set(
            emp["department"]
            for emp in employees
        )
    )

    return {
        "totalEmployees": total_employees,
        "activeEmployees": active_employees,
        "averageSalary": round(average_salary),
        "departments": departments
    }      