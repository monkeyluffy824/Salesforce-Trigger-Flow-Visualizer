Overview
This Chrome Extension helps Salesforce developers visualize the execution order of key automation components when performing DML operations (Insert, Update, Delete) on Salesforce objects using Mermaid and Shoelace for UI.
Features
•	Display Apex Triggers execution order (Before Insert, After Update, etc.).
•	Display Total No of Custom Rules Validation Rules applied during the operation.
•	Display Total No of Assignment Rules triggered during DML operations.
•	Visualize the execution flow using Mermaid.js journey diagrams.
•	Dynamically generate diagrams per selected operation (Insert, Update, etc.).
How It Works
1.	Queries Salesforce Tooling API for:
   - ApexTrigger
   - ValidationRule
   - AssignmentRule
2.	Processes the data to group components by execution timing (Before/After).
3.	Generates a clean Mermaid diagram string.
4.	Injects and renders the diagram in the popup window.
Known Limitation
Retrieving Flow details (Record-Triggered Flows) is not supported via Tooling API or Metadata API in this project.
Flow execution steps are not included in the visualized journey.
Installation
5.	Clone or download this repository.
6.	Open Edge/chrome → Extensions → Enable Developer Mode.
7.	Click 'Load unpacked' → Select the project folder.
8.	Click the extension icon in the toolbar to use.
