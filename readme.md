# 🚦 REAL-TIME TRAFFIC MANAGEMENT SIMULATION

An AI-powered traffic signal controller that uses live camera feeds and YOLO-based vehicle detection to adjust green signal time based on real-time traffic density. This helps reduce congestion, save fuel, and improve overall traffic flow.

---

## 📌 Features

- Detects and counts vehicles using YOLO object detection
- Automatically adjusts green signal duration based on traffic load
- Gives priority to heavily congested lanes
- Includes a complete traffic simulation using Pygame
- Reduces waiting time, congestion, and fuel usage

---

## 🧩 How It Works (Simple Explanation)

### **1. Vehicle Detection**

The system captures images from traffic cameras and identifies:

- Cars
- Bikes
- Buses
- Trucks
- Rickshaws

### **2. Adaptive Timer Algorithm**

Based on the number of vehicles, the algorithm:

- Calculates how long each direction should stay green
- Gives more time to crowded lanes
- Ensures fairness across all directions

### **3. Simulation**

A custom simulation (made in Pygame) visually shows how vehicles move and how signals change in real-time.

---

## 📁 Project Structure

```
Real_time_Traffic_management/
│
├── Code/
│   ├── YOLO/
│   │   └── darkflow/       # YOLO model & configs
│   ├── vehicle_detection.py
│   └── simulation.py        # Traffic simulator
│
├── Demo.gif
├── vehicle-detection.png
└── README.md
```

---

# 📥 Installation (Copy & Paste)

### **1. Clone the Repository**

```sh
git clone https://github.com/2004kushsutar/bheed
```

### **2. Download YOLO Weights**

Download weights from here:  
https://drive.google.com/file/d/1flTehMwmGg-PMEeQCsDS2VWRLGzV6Wdo/view?usp=sharing

Place the file inside:

```
Real_time_Traffic_management/Code/YOLO/darkflow/bin
```

### **3. Install Required Libraries**

```sh
cd Real_time_Traffic_management/Code/YOLO/darkflow
pip install -r requirements.txt
python setup.py build_ext --inplace
```

### **4. Run the System**

#### Run Vehicle Detection:

```sh
python vehicle_detection.py
```

#### Run Simulation:

```sh
python simulation.py
```

---

### **Simulation Demo**

![Simulation](./Demo.mp4)

---

## 👥 Contributors

| Name              | GitHub                           |
| ----------------- | -------------------------------- |
| Adarsh Pathak     | https://github.com/Adarsh152004  |
| Hrishee Prajapati | https://github.com/Hrishee-das   |
| Vinit Prajapati   | https://github.com/vinit-proj06  |
| Kush Sutar        | https://github.com/2004kushsutar |
