// required npm packages...................
var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table");

//line 7 to 17 connecting to the database and receiving connection ID and run displayInventory();........
var connection = mysql.createConnection({
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: 'root',
	database: 'bamazon'
});

connection.connect(function (err) {
	if (err) throw err;
	console.log("connected as id" + connection.threadId);
	displayInventory();
});
// displays all the products available in the products table.......
function displayInventory() {
	connection.query('SELECT * FROM Products', function (err, res) {
		if (err) { console.log(err) };
		var table = new Table({
			head: ['item_id', 'item_name', 'department_name', 'price', 'stock_quantity'],
			colWidths: [10, 30, 30, 20, 20]
		});
		for (i = 0; i < res.length; i++) {
			table.push(
				[res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]
			);
		}
		console.log(table.toString());
		inventoryUpdates();
	});
};
//once the displayInventory() is done run inventoryUpdates() to prompt the manager to pick one Option..
function inventoryUpdates() {
	inquirer.prompt([{
		name: "action",
		type: "list",
		message: "Choose an option below to manage current inventory:",
		choices: ["Restock Inventory", "Add New Product", "Remove An Existing Product"]
	}]).then(function (answers) {
		switch (answers.action) {
			case 'Restock Inventory':
				restockRequest();
				break;
			case 'Add New Product':
				addNewItem();
				break;
			case 'Remove An Existing Product':
				removeRequest();
				break;
		}
	});
};

//once manager picks an option "restockRequest()" prompt to ask the Id and Units to restock....
function restockRequest() {

	inquirer.prompt([
		{
			type: "input",
			name: "inputId",
			message: "Please enter the item_id you would like to add.",
		},
		{
			type: "input",
			name: "inputNumber",
			message: "How many units of this item would you like to add?",

		}
	]).then(function (addQuantity) {

		//connect to database to and add the quantity to the table.........
		connection.query("SELECT * FROM products WHERE item_id=?", addQuantity.inputId, function (err, res) {
			for (var i = 0; i < res.length; i++) {




				console.log((res[i].stock_quantity, addQuantity.inputNumber));
				var newStock = (res[i].stock_quantity + parseInt(addQuantity.inputNumber));
				var updateId = (addQuantity.inputId);


				confirmPrompt(newStock, updateId);
			}
		});
	});
}

//=================================Confirm Purchase===============================
//when manager confirms update the table ...........
function confirmPrompt(newStock, updateId) {

	inquirer.prompt([{

		type: "confirm",
		name: "add",
		message: "Are you sure you would like to add this item and quantity?",
		default: true

	}]).then(function (addConfirm) {
		if (addConfirm.add === true) {
			

			connection.query("UPDATE products SET ? WHERE ?", [{
				stock_quantity: newStock
			}, {
				item_id: updateId
			}], function (err, res) { });

			console.log("=================================");
			console.log("Quantity added to the inventory.");
			console.log("=================================");
			displayInventory();
		}
	});
}

// a function to add new item to the table products..........
function addNewItem() {

	//ask user to fill in all necessary information to fill columns in table

	inquirer.prompt([
		{
			type: "input",
			name: "inputId",
			message: "Please enter New ID.",
		},
		{
			type: "input",
			name: "inputName",
			message: "Please enter the item name of the new product.",
		},
		{
			type: "input",
			name: "inputDepartment",
			message: "Please enter which department name of which the new product belongs.",
		},
		{
			type: "input",
			name: "inputPrice",
			message: "Please enter the price of the new product (0.00).",
		},
		{
			type: "input",
			name: "inputStock",
			message: "Please enter the stock quantity of the new product.",
		}
//if manager enters the required fileds to add new item. then promice to insert that item into the table products....
	]).then(function (managerNew) {

	

		connection.query("INSERT INTO products SET ?", {
			item_id: parseInt(managerNew.inputId),
			product_name: managerNew.inputName,
			department_name: managerNew.inputDepartment,
			price: parseFloat(managerNew.inputPrice),
			stock_quantity: parseInt(managerNew.inputStock)
		}, function (err, res) {
			if (err) throw err;
			console.log(res);
			console.log("=========================================");
			console.log("The new item is Added to the Invetory..!!");
			console.log("=========================================");


		});
		displayInventory();
	});
}


//the function to remove the existing item from the table products.........
function removeRequest() {
	inquirer.prompt([{
		name: "ID",
		type: "input",
		message: "What is the item ID  of the you would like to remove?"
//once the manager enters the ID to delete the item than delete that particular item from the table.......	
	}]).then(function (deleteItem) {
		connection.query("DELETE FROM products WHERE ?", {
			item_id: deleteItem.ID,

		}, function (err, res) {
			if (err) throw err;
			console.log(res);
			console.log("=====================================");
			console.log("The item is deleted from Invetory..!!");
			console.log("=====================================");


		});
		//once the item is deleted display the most updated table............
		displayInventory();
	});
};

