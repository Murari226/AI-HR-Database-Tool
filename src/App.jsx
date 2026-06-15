import { useState, useEffect } from "react";
import { employees } from "./data/employees";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

import { Bar } from "react-chartjs-2";

function App() {
  const [search, setSearch] = useState("");
 const [employeeList, setEmployeeList] = useState([]);
 const [stats, setStats] = useState({
  totalEmployees: 0,
  activeEmployees: 0,
  averageSalary: 0,
  departments: 0,
  
});

  const [statusFilter, setStatusFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");

  const [newName, setNewName] = useState("");
  const [newDepartment, setNewDepartment] = useState("");
  const [newSalary, setNewSalary] = useState("");
  const [newStatus, setNewStatus] = useState("Active");
  const [editingId, setEditingId] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

const [username, setUsername] = useState("");
const [password, setPassword] = useState("");
const handleLogin = () => {

  if (
    username === "admin" &&
    password === "admin123"
  ) {

    setIsLoggedIn(true);

localStorage.setItem(
  "isLoggedIn",
  "true"
);

  } else {

    alert("Invalid Username or Password");

  }

};
const filteredEmployees = employeeList.filter((employee) => {
  const matchesSearch =
    employee.name.toLowerCase().includes(search.toLowerCase()) ||
    employee.department.toLowerCase().includes(search.toLowerCase()) ||
    employee.status.toLowerCase().includes(search.toLowerCase()) ||
    employee.id.toString().includes(search) ||
    employee.salary.toString().includes(search);

  const matchesStatus =
    statusFilter === "All" ||
    employee.status === statusFilter;
  
    const matchesDepartment =
  departmentFilter === "All" ||
  employee.department === departmentFilter;

return matchesSearch && matchesStatus && matchesDepartment;
}).sort((a, b) => a.id - b.id);
  const totalEmployees = employeeList.length;
  const totalDepartments = new Set(
  employeeList.map(employee => employee.department)
  ).size;

 const averageSalary =
  employeeList.length > 0
    ? Math.round(
        employeeList.reduce(
          (sum, employee) => sum + employee.salary,
          0
        ) / employeeList.length
      )
    : 0;
  const activeEmployees = employeeList.filter(
  employee => employee.status === "Active"
).length;

const departmentCounts = employeeList.reduce((acc, employee) => {
  const department = employee.department.trim().toUpperCase();

  acc[department] = (acc[department] || 0) + 1;

  return acc;
}, {});
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
};
const chartData = {
  labels: Object.keys(departmentCounts),
  datasets: [
    {
      label: "Employees per Department",
      data: Object.values(departmentCounts),
    },
  ],
};
const salaryChartData = {
  labels: employeeList.map(employee => employee.name),
  datasets: [
    {
      label: "Employee Salaries",
      data: employeeList.map(employee => employee.salary),
    },
  ],
};
const addEmployee = async () => {
  const newEmployee = {
    id: employeeList.length + 1,
    name: newName,
    department: newDepartment,
    salary: Number(newSalary),
    status: newStatus,
  };

  try {
    await axios.post(
      "http://127.0.0.1:8000/employees",
      newEmployee
    );

    const response = await axios.get(
      "http://127.0.0.1:8000/employees"
    );

    setEmployeeList(response.data);

    setNewName("");
    setNewDepartment("");
    setNewSalary("");
    setNewStatus("Active");
  } catch (error) {
    console.error(error);
  }
};

useEffect(() => {

  const loggedIn = localStorage.getItem("isLoggedIn");

  if (loggedIn === "true") {
    setIsLoggedIn(true);
  }

}, []);
useEffect(() => {
  axios
    .get("http://127.0.0.1:8000/employees")
    .then((response) => {
      console.log("API DATA:", response.data);
      setEmployeeList(response.data);
      axios
  .get("http://127.0.0.1:8000/stats")
  .then((response) => {
    setStats(response.data);
  });
    })
    .catch((error) => {
      console.error("API ERROR:", error);
    });
}, []);
useEffect(() => {
  localStorage.setItem(
    "employees",
    JSON.stringify(employeeList)
  );
}, [employeeList]);
const deleteEmployee = async (id) => {
  try {
    await axios.delete(
      `http://127.0.0.1:8000/employees/${id}`
    );

    const response = await axios.get(
      "http://127.0.0.1:8000/employees"
    );

    setEmployeeList(response.data);

  } catch (error) {
    console.error(error);
  }
};
const startEdit = (employee) => {
  

  setEditingId(employee.id);

  setNewName(employee.name);
  setNewDepartment(employee.department);
  setNewSalary(employee.salary);
  setNewStatus(employee.status);
};const updateEmployee = async () => {

  const updatedEmployee = {
    id: editingId,
    name: newName,
    department: newDepartment.trim().toUpperCase(),
    salary: Number(newSalary),
    status: newStatus,
  };

  try {

    await axios.put(
      `http://127.0.0.1:8000/employees/${editingId}`,
      updatedEmployee
    );

    const response = await axios.get(
      "http://127.0.0.1:8000/employees"
    );

    setEmployeeList(response.data);

    setEditingId(null);

    setNewName("");
    setNewDepartment("");
    setNewSalary("");
    setNewStatus("Active");

  } catch (error) {
    console.error(error);
  }
};
const exportToCSV = () => {
  const headers = [
    "ID",
    "Name",
    "Department",
    "Salary",
    "Status",
  ];

  const rows = employeeList.map((employee) => [
    employee.id,
    employee.name,
    employee.department,
    employee.salary,
    employee.status,
  ]);

  const csvContent =
    [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");

  const blob = new Blob(
    [csvContent],
    { type: "text/csv" }
  );

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = "employees.csv";

  link.click();

  window.URL.revokeObjectURL(url);
};
if (!isLoggedIn) {

  return (

    <div className="min-h-screen flex justify-center items-center bg-slate-900">

      <div className="bg-white p-8 rounded-lg w-80">

        <h1 className="text-2xl font-bold mb-4">
          Login
        </h1>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) =>
            setUsername(e.target.value)
          }
          className="border p-2 w-full mb-3"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          className="border p-2 w-full mb-3"
        />

        <button
          onClick={handleLogin}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          Login
        </button>

      </div>

    </div>

  );

}

  return (
  
    <div className="min-h-screen bg-slate-900 text-white p-8">

      <div className="flex justify-between items-center mb-8">

  <h1 className="text-5xl font-bold">
    AI HR Database Tool
  </h1>

  <button
    onClick={() => {

  setIsLoggedIn(false);

  localStorage.removeItem(
    "isLoggedIn"
  );

}}
    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
  >
    Logout
  </button>

</div>
    <div className="grid grid-cols-4 gap-6 mb-8">

    <div className="bg-blue-600 p-6 rounded-xl text-center shadow-lg">
    <h2 className="text-lg font-semibold">
      Total Employees
    </h2>
     <p className="text-3xl font-bold mt-2">
    {stats.totalEmployees}
   </p>
  </div>

  <div className="bg-purple-600 p-6 rounded-xl text-center shadow-lg">
    <h2 className="text-lg font-semibold">
      Departments
    </h2>
    <p className="text-3xl font-bold mt-2">
    {stats.departments}
    </p>
  </div>

  <div className="bg-orange-600 p-6 rounded-xl text-center shadow-lg">
    <h2 className="text-lg font-semibold">
      Average Salary
    </h2>
   <p className="text-3xl font-bold mt-2">
  ₹{stats.averageSalary}
  </p>
  </div>
  <div className="bg-green-600 p-6 rounded-xl text-center shadow-lg">
  <h2 className="text-lg font-semibold">
    Active Employees
  </h2>
  <p className="text-3xl font-bold mt-2">
    {stats.activeEmployees}
  </p>
</div>

</div>
<div className="bg-slate-800 p-6 rounded-xl mb-8">
  <h2 className="text-2xl font-bold mb-4">
    Department Summary
  </h2>

{Object.entries(departmentCounts).map(([department, count]) => (
  <div key={department} className="mb-4">

    <div className="flex justify-between mb-1">
      <span>{department}</span>
      <span>{count} Employee(s)</span>
    </div>

    <div className="w-full bg-slate-700 rounded-full h-3">
      <div
        className="bg-blue-500 h-3 rounded-full"
        style={{ width: `${count * 25}%` }}
      ></div>
    </div>

  </div>
))}
</div>
<div className="bg-slate-800 p-6 rounded-xl mb-8">
  <h2 className="text-2xl font-bold mb-4">
    Department Analytics
  </h2>

 <div className="h-80">
  <Bar
    data={chartData}
    options={chartOptions}
  />
</div>
</div>
<div className="bg-slate-800 p-6 rounded-xl mb-8">
  <h2 className="text-2xl font-bold mb-4">
    Salary Analytics
  </h2>

  <div className="h-80">
    <Bar
      data={salaryChartData}
      options={chartOptions}
    />
  </div>
</div>
<div className="bg-slate-800 p-6 rounded-xl mb-8">
 <h2 className="text-2xl font-bold mb-4">
  {editingId ? "Edit Employee" : "Add Employee"}
</h2>

  <div className="grid grid-cols-4 gap-4">

    <input
      type="text"
      placeholder="Name"
      value={newName}
      onChange={(e) => setNewName(e.target.value)}
      className="border p-2 rounded text-black"
    />

    <input
      type="text"
      placeholder="Department"
      value={newDepartment}
      onChange={(e) => setNewDepartment(e.target.value)}
      className="border p-2 rounded text-black"
    />

    <input
      type="number"
      placeholder="Salary"
      value={newSalary}
      onChange={(e) => setNewSalary(e.target.value)}
      className="border p-2 rounded text-black"
    />

    <select
      value={newStatus}
      onChange={(e) => setNewStatus(e.target.value)}
      className="border p-2 rounded text-black"
    >
      <option value="Active">Active</option>
      <option value="Inactive">Inactive</option>
    </select>

  </div>
 <button
  onClick={editingId ? updateEmployee : addEmployee}
  className="mt-4 bg-blue-600 px-4 py-2 rounded-lg"
>
  {editingId ? "Update Employee" : "Add Employee"}
</button>    
<button
  onClick={exportToCSV}
  className="mt-4 ml-4 bg-green-600 px-4 py-2 rounded-lg"
>
  Export CSV
</button>
</div>

<div className="flex justify-center gap-4 mb-6">

  <input
    type="text"
    placeholder="Search ID, Name, Department, Salary or Status..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="border p-3 rounded-lg w-80 text-black"
  />

  <select
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
    className="border p-3 rounded-lg text-black"
  >
    <option value="All">All</option>
    <option value="Active">Active</option>
    <option value="Inactive">Inactive</option>
  </select>
  <select
  value={departmentFilter}
  onChange={(e) => setDepartmentFilter(e.target.value)}
  className="border p-3 rounded-lg text-black"
>
  <option value="All">All Departments</option>
  <option value="Engineering">Engineering</option>
  <option value="HR">HR</option>
  <option value="AI">AI</option>
  <option value="Marketing">Marketing</option>
</select>

</div>
      <div className="flex justify-center">
        <table className="border border-gray-500">
          <thead>
            <tr className="bg-slate-700">
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Department</th>
              <th className="border px-4 py-2">Salary</th>
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredEmployees.map((employee) => (
              <tr key={employee.id}>
                <td className="border px-4 py-2">{employee.id}</td>
                <td className="border px-4 py-2">{employee.name}</td>
                <td className="border px-4 py-2">{employee.department}</td>
                <td className="border px-4 py-2">
                  ₹{employee.salary}
                </td>
 <td className="border px-4 py-2">
  <span
    className={
      employee.status === "Active"
        ? "bg-green-500 px-3 py-1 rounded"
        : "bg-red-500 px-3 py-1 rounded"
    }
  >
    {employee.status}
  </span>
</td>
<td className="border px-4 py-2 flex gap-2">
<button
  onClick={() => setSelectedEmployee(employee)}
  className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded"
>
  View
</button>
  <button
    onClick={() => startEdit(employee)}
    className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded"
  >
    Edit
  </button>

  <button
    onClick={() => {
      if (window.confirm("Delete this employee?")) {
        deleteEmployee(employee.id);
      }
    }}
    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
  >
    Delete
  </button>

</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
{selectedEmployee && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">

    <div className="bg-white text-black p-6 rounded-lg w-96">

      <h2 className="text-2xl font-bold mb-4">
        Employee Details
      </h2>

      <p>ID: {selectedEmployee.id}</p>
      <p>Name: {selectedEmployee.name}</p>
      <p>Department: {selectedEmployee.department}</p>
      <p>Salary: ₹{selectedEmployee.salary}</p>
      <p>Status: {selectedEmployee.status}</p>

      <button
        onClick={() => setSelectedEmployee(null)}
        className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
      >
        Close
      </button>

    </div>

  </div>
)}

<footer className="text-center mt-10 text-gray-400">
  AI HR Database Tool © 2026
</footer>

    </div>
  );
}

export default App;