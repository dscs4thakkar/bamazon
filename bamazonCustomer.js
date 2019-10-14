// required npm packages...................
var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table");

//line 7 to 21 connecting to the database and receiving connection ID and run startDisplay();........
var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'bamazon'
});

connection.connect(function (err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }
    console.log('connected as id ' + connection.threadId);
    startDisplay();
});
// display the welcome message and ask user to view the inventory.....
function startDisplay() {

    inquirer.prompt([{

        type: "confirm",
        name: "confirm",
        message: "Welcome to BAMAZON..!!! Would you like to view the inventory?",
        default: true
        //if user click "Y" run the inventory(); else log message "Thank you! please visit again!".......
    }]).then(function (user) {
        if (user.confirm === true) {
            inventory();
        } else {
            console.log("Thank you! please visit again!");
        }
    });
}

//Ref: npm cli-table to display the table and set the widths.................................

function inventory() {


    var table = new Table({
        head: ['item_id', 'item_name', 'department_name', 'price', 'stock_quantity'],
        colWidths: [10, 30, 30, 20, 20]
    });

    listInventory();

    function listInventory() {

        connection.query("SELECT * FROM products", function (err, res) {
            for (var i = 0; i < res.length; i++) {

                var item_id = res[i].item_id,
                    product_name = res[i].product_name,
                    department_name = res[i].department_name,
                    price = res[i].price,
                    stock_quantity = res[i].stock_quantity;

                table.push(
                    [item_id, product_name, department_name, price, stock_quantity]
                );
            }

            console.log("====================================================== Bamazon Inventory ======================================================");
            console.log(table.toString());
            continueDisplay();
        });
    }
}

//=================================Inquirer user purchase===============================

function continueDisplay() {

    inquirer.prompt([{

        type: "confirm",
        name: "continue",
        message: "Would you like to purchase an item?",
        default: true
        //if the user hit 'Y' run selectionPrompt else display the message 'Thank you! Come back soon!'
    }]).then(function (user) {
        if (user.continue === true) {
            selectionPrompt();
        } else {
            console.log("Thank you! Come back soon!");
        }
    });
}

//=================================Item selection and Quantity desired===============================
//prompts the user to enter the item ID and units that he would like to purchase........
function selectionPrompt() {

    inquirer.prompt([{

        type: "input",
        name: "inputId",
        message: "Please enter the item_id you would like to purchase.",
    },
    {
        type: "input",
        name: "inputNumber",
        message: "How many units of this item would you like to purchase?"

    }
    ]).then(function (userPurchase) {

        //connect to database to find stock_quantity in database. If user quantity input is greater than stock, decline purchase.

        connection.query("SELECT * FROM products WHERE item_id=?", userPurchase.inputId, function (err, res) {
            for (var i = 0; i < res.length; i++) {

                if (userPurchase.inputNumber > res[i].stock_quantity) {

                    console.log("===================================================");
                    console.log("Sorry! Not enough stock. Please try again later.");
                    console.log("===================================================");
                    startDisplay();

                } else {
                    //variable created to get the TAX value and FINAL PRICE INCL. TAX.
                    var totalPrice = res[i].price * userPurchase.inputNumber;
                    var taxValue = res[i].price * userPurchase.inputNumber * 7 / 100;
                    var finalPrice = totalPrice + taxValue;

                    //list item information for user for confirm prompt
                    console.log("===============================================");
                    console.log("----GREAT.!!!! your order is under process.----");
                    console.log("===============================================");
                    console.log("--------Here is your INVOICE look like---------");
                    console.log("-----------------------------------------------");
                    console.log("Item                 : " + res[i].product_name);
                    console.log("Department           : " + res[i].department_name);
                    console.log("Price                : " + res[i].price);
                    console.log("Quantity             : " + userPurchase.inputNumber);
                    console.log("-----------------------------------------------");
                    console.log("Total Price          : " + res[i].price * userPurchase.inputNumber);
                    console.log("Plus Tax(7%)         : " + res[i].price * userPurchase.inputNumber * 7 / 100);
                    console.log("===============================================");
                    console.log("Final Price(Incl Tax): " + finalPrice);
                    console.log("===============================================");

                    var newStock = (res[i].stock_quantity - userPurchase.inputNumber);
                    var purchaseId = (userPurchase.inputId);

                    confirmPrompt(newStock, purchaseId);
                }
            }
        });
    });
}

//=================================Confirm Purchase===============================

function confirmPrompt(newStock, purchaseId) {

    inquirer.prompt([{

        type: "confirm",
        name: "confirmPurchase",
        message: "Are you sure you would like to purchase this item and quantity?",
        default: true

    }]).then(function (userConfirm) {
        if (userConfirm.confirmPurchase === true) {
            console.log("---------:Please go to checkout to make the payment:---------");
            //if user confirms purchase, update mysql database with new stock quantity by subtracting user quantity purchased.

            connection.query("UPDATE products SET ? WHERE ?", [{
                stock_quantity: newStock
            }, {
                item_id: purchaseId
            }], function (err, res) { });

            console.log("=================================");
            console.log("Transaction completed.");
            console.log("=================================");
            startDisplay();
        } else {
            console.log("=================================");
            console.log("No problem. Maybe next time!");
            console.log("=================================");
            //once the transcation is completed display the most updated inventory.......
            startDisplay();
        }
    });
}