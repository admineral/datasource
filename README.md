# VN1 Forecasting - Accuracy Challenge

[![Challenge](https://img.shields.io/badge/challenge-$20,000-informational.svg)]()
[![Phase](https://img.shields.io/badge/phase-1-orange.svg)]()

## 📖 Overview

Welcome to the **VN1 Forecasting - Accuracy Challenge**! This challenge offers a unique opportunity to enhance your predictive modeling skills and compete for a share of **$20,000 in prizes**. The grand prize is a whopping **$10,000**. Beyond the monetary rewards, this challenge will allow you to gain insights from industry professionals, and top performers may even unlock internship or job placement opportunities.

### What is the Challenge About?

In this challenge, your task is to **forecast future sales** for different products. You'll be given historical sales data (past sales), inventory data (how much stock is available), and pricing data (how much the products cost). Using this information, you need to build a model that can predict how much of each product will sell in the future.

### How Does it Work?

The competition is divided into two phases:

- **Phase 1**: 
  - **Starts**: 15th August 2024
  - **Ends**: 5th September 2024
  - **What to Do**: Use the provided data from a previous period (Phase 0) to predict sales for Phase 1.
  - **Live Leaderboard**: During this phase, there will be a live leaderboard where you can see how your predictions compare to others. This helps you track your progress and make adjustments to improve your model.

- **Phase 2**: 
  - **Starts**: 5th September 2024
  - **Ends**: 19th September 2024
  - **What to Do**: Use both the data from Phase 0 and the actual sales data from Phase 1 to predict sales for Phase 2.
  - **No Live Leaderboard**: Unlike Phase 1, there will be no live updates. The final results will be announced after the phase ends.

## 📅 Timeline

Here’s a quick rundown of the important dates:

- **Challenge Starts**: 15th August 2024 at 05:00 UTC
- **Phase 1 Ends**: 5th September 2024 at 08:00 UTC
- **Phase 2 Ends (Public Leaderboard)**: 19th September 2024 at 13:00 UTC
- **Phase 2 Ends (Private Leaderboard)**: 19th September 2024 at 13:00 UTC
- **Winner Announcement**: Week of 23rd September 2024
- **Online Conference**: October 2024, where winners will present their solutions.

## 🛠️ Evaluation

### How Will Your Work Be Evaluated?

Your predictions will be evaluated based on two main criteria: **Accuracy** and **Bias**. These will be combined into a final **Score**.

Let’s break this down:

- **Accuracy (MAE%)**: This measures how close your predictions are to the actual sales numbers. The smaller the difference, the better your accuracy.

- **Bias (Bias%)**: This measures whether your predictions are consistently too high or too low. If your predictions are unbiased, it means you're equally likely to overestimate or underestimate sales.

These scores are calculated only when the product has been in stock for at least 4 days during a week. This is to ensure that we don't unfairly penalize predictions when there's a stockout (when a product is not available for sale).

### Detailed Explanation of the Evaluation Metrics

Let’s dive deeper into the formulas:

1. **In Stock Condition**: 

   \[
   \text{In Stock} = \text{Inventory} \geq 4 \text{ days during the week}
   \]

   This condition checks whether the product was in stock for at least 4 days during a given week. If not, that week’s sales data won’t be used in the evaluation.

2. **Accuracy (MAE%)**:

   \[
   \text{Accuracy (MAE\%)} = \frac{\sum_{\text{in-stock periods}} |F - D|}{\sum_{\text{in-stock periods}} D}
   \]

   - **F**: Your forecasted sales
   - **D**: The actual sales data
   
   The formula sums up the absolute differences between your predictions (F) and the actual sales (D) over all the weeks when the product was in stock. Then, it divides this sum by the total actual sales during those weeks, to give a percentage error.

   - **In Simple Terms**: It’s like asking, "On average, how far off were your predictions from the real numbers?"

3. **Bias (Bias%)**:

   \[
   \text{Bias (Bias\%)} = \frac{\sum_{\text{in-stock periods}} (F - D)}{\sum_{\text{in-stock periods}} D}
   \]

   This measures whether your predictions tend to be higher or lower than the actual sales.

   - **In Simple Terms**: If you consistently over-predict, this number will be positive. If you consistently under-predict, it will be negative. We take the absolute value (ignore the sign) to combine it with Accuracy.

4. **Final Score**:

   \[
   \text{Score \%} = \text{MAE\%} + |\text{Bias\%}|
   \]

   Your final score is the sum of your accuracy and bias percentages. The goal is to have the lowest possible score, meaning your predictions were both accurate and unbiased.

### Evaluation Code

Here is the code that will be used to calculate these scores:

```python
def data_competition_evaluation(phase="Phase 2", name=""):
    submission = pd.read_csv(name).set_index(["Client", "Warehouse", "Product"])
    submission.columns = pd.to_datetime(submission.columns)
    objective = pd.read_csv(f"{phase} - Sales.csv").set_index(["Client", "Warehouse", "Product"])
    objective.columns = pd.to_datetime(objective.columns)
    in_stock = pd.read_csv(f"{phase} - Inventory.csv").set_index(["Client", "Warehouse", "Product"])
    in_stock.columns = pd.to_datetime(in_stock.columns)
    in_stock = in_stock.fillna(7) > 3
    objective[~in_stock] = np.nan
    abs_err = np.nansum(abs(submission - objective))
    err = np.nansum((submission - objective))
    score = (abs_err + abs(err)) / objective.sum().sum()
    print(f"{name}: {score}")

Let’s dive deeper into the formulas:

1. **In Stock Condition**: 

   \[
   \text{In Stock} = \text{Inventory} \geq 4 \text{ days during the week}
   \]

   This condition checks whether the product was in stock for at least 4 days during a given week. If not, that week’s sales data won’t be used in the evaluation.

2. **Accuracy (MAE%)**:

   \[
   \text{Accuracy (MAE\%)} = \frac{\sum_{\text{in-stock periods}} |F - D|}{\sum_{\text{in-stock periods}} D}
   \]

   - **F**: Your forecasted sales
   - **D**: The actual sales data
   
   The formula sums up the absolute differences between your predictions (F) and the actual sales (D) over all the weeks when the product was in stock. Then, it divides this sum by the total actual sales during those weeks, to give a percentage error.

   - **In Simple Terms**: It’s like asking, "On average, how far off were your predictions from the real numbers?"

3. **Bias (Bias%)**:

   \[
   \text{Bias (Bias\%)} = \frac{\sum_{\text{in-stock periods}} (F - D)}{\sum_{\text{in-stock periods}} D}
   \]

   This measures whether your predictions tend to be higher or lower than the actual sales.

   - **In Simple Terms**: If you consistently over-predict, this number will be positive. If you consistently under-predict, it will be negative. We take the absolute value (ignore the sign) to combine it with Accuracy.

4. **Final Score**:

   \[
   \text{Score \%} = \text{MAE\%} + |\text{Bias\%}|
   \]

   Your final score is the sum of your accuracy and bias percentages. The goal is to have the lowest possible score, meaning your predictions were both accurate and unbiased.

### Evaluation Code

Here is the code that will be used to calculate these scores:

```python
def data_competition_evaluation(phase="Phase 2", name=""):
    submission = pd.read_csv(name).set_index(["Client", "Warehouse", "Product"])
    submission.columns = pd.to_datetime(submission.columns)
    objective = pd.read_csv(f"{phase} - Sales.csv").set_index(["Client", "Warehouse", "Product"])
    objective.columns = pd.to_datetime(objective.columns)
    in_stock = pd.read_csv(f"{phase} - Inventory.csv").set_index(["Client", "Warehouse", "Product"])
    in_stock.columns = pd.to_datetime(in_stock.columns)
    in_stock = in_stock.fillna(7) > 3
    objective[~in_stock] = np.nan
    abs_err = np.nansum(abs(submission - objective))
    err = np.nansum((submission - objective))
    score = (abs_err + abs(err)) / objective.sum().sum()
    print(f"{name}: {score}")








## 📊 Datasets

### 📝 Data Description

Participants will be provided with several datasets essential for building their predictive models. These datasets will be made available upon the official launch of the challenge to all registered participants. The data is structured in CSV (Comma-Separated Values) format, making it easy to manipulate using various tools and programming languages such as Python or R.

### 🔄 How to Get Started

To begin, download the provided **Phase 0** data. This data will serve as the foundation for your initial models. You are free to use any tools or methods to analyze the data and develop your sales predictions. As you progress through the competition, keep an eye on your ranking via the live leaderboard, which will update based on your submissions.

In each phase of the competition, you will receive separate CSV files containing the following types of data:

### 📂 Dataset Files

#### 1. **Sales Data (Phase X - Sales.csv)**
   - **Description**: This file contains the number of weekly units sold for various products. The data is provided at the granularity of client, warehouse, and product.
   - **Purpose**: Use this data to understand past sales trends. Your task is to predict future sales based on this historical data.
   - **Structure**:
     - **Columns**:
       - `Client`: The identifier for the client.
       - `Warehouse`: The identifier for the warehouse.
       - `Product`: The product identifier.
       - `Week_X`: The number of units sold in a specific week (where X represents the week number).
   - **Example**:
     | Client | Warehouse | Product | Week_1 | Week_2 | ... | Week_13 |
     |--------|-----------|---------|--------|--------|-----|---------|
     | C001   | W001      | P001    | 120    | 130    | ... | 140     |

#### 2. **Inventory Data (Phase X - Inventory.csv)**
   - **Description**: This file contains the number of days per week with positive inventory ending positions, indicating product availability. It helps in understanding whether a product was available for sale during a given week.
   - **Purpose**: Use this data to adjust your sales predictions based on stock availability. For instance, low inventory levels could explain low sales figures, helping to avoid skewed predictions.
   - **Structure**:
     - **Columns**:
       - `Client`: The identifier for the client.
       - `Warehouse`: The identifier for the warehouse.
       - `Product`: The product identifier.
       - `Week_X`: The number of days with positive inventory (out of 7) in a specific week (where X represents the week number).
   - **Example**:
     | Client | Warehouse | Product | Week_1 | Week_2 | ... | Week_13 |
     |--------|-----------|---------|--------|--------|-----|---------|
     | C001   | W001      | P001    | 7      | 6      | ... | 7       |

#### 3. **Price Data (Phase X - Price.csv)**
   - **Description**: This file lists product pricing information based on actual transactions. Prices are only available if there were transactions for the product during a specific week.
   - **Purpose**: Use this data to account for the impact of pricing on sales. For example, price drops may lead to increased sales, while price hikes could reduce demand.
   - **Structure**:
     - **Columns**:
       - `Client`: The identifier for the client.
       - `Warehouse`: The identifier for the warehouse.
       - `Product`: The product identifier.
       - `Week_X`: The price of the product during a specific week (where X represents the week number).
   - **Example**:
     | Client | Warehouse | Product | Week_1 | Week_2 | ... | Week_13 |
     |--------|-----------|---------|--------|--------|-----|---------|
     | C001   | W001      | P001    | 19.99  | 19.99  | ... | 18.49   |

### 📋 Expected Prediction Task

Participants are tasked with developing robust predictive models that can accurately forecast future sales. The models should consider historical sales, inventory, and pricing data provided in the datasets. The goal is to anticipate sales trends for various products across different clients and warehouses.

- **Prediction Output**: Your predictions should be submitted in CSV format, forecasting sales for the next 13 weeks.
- **Evaluation Criteria**: Predictions will be evaluated based on their **accuracy** and **bias** compared to the actual sales figures. The goal is to minimize the error between your forecasted values and the real-world data.

### 📦 Downloadable Files

You will have access to the following files during the competition:

#### Test Datasets (for Practice and Model Validation)
- **Test Dataset**: 2.99 MB
- **Sample Dataset**: 2.05 MB
- **Final Test Dataset**: 2.99 MB

#### Resource Files (Main Competition Data)
- **Phase 0 - Sales**: 33.64 MB
- **Phase 0 - Inventory**: 13.4 MB
- **Phase 0 - Price**: 18.3 MB

These files are crucial for developing your models, testing them, and making final submissions. Make sure to explore each dataset thoroughly to understand the patterns and relationships within the data.

### 💡 Tips for Success

- **Understand the Data**: Take time to explore and visualize the data. Look for trends, patterns, and outliers.
- **Feature Engineering**: Consider creating additional features that might improve your model, such as average price per week or rolling averages of sales.
- **Model Selection**: Start with simple models and gradually move to more complex ones as you gain insights from the data.
- **Cross-Validation**: Use cross-validation techniques to ensure your model is generalizing well to unseen data.
- **Monitor the Leaderboard**: Use the leaderboard during Phase 1 to track your performance and iteratively improve your model.

## 🔗 Further Information

For more details on the competition, including rules, evaluation criteria, and submission guidelines, please refer to the [official competition page](#).