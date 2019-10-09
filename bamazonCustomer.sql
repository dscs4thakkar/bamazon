create database bamazon;
use bamazon;
create table products(
item_id integer(3) not null auto_increment,
product_name varchar(30) null,
department_name varchar(30) null,
price decimal(10,2) null,
stock_quantity integer(4),
primary key(item_id)
);
insert into products(product_name, department_name, price, stock_quantity)
values("shoes", "foot wear", 29.99, 12),
("glasses", "accessories", 19.49, 9),
("head phones", "electronics", 19.99, 25),
("phone cover", "mobile accessories", 22.00, 50),
("electric car", "kids toys", 229.99, 5),
("jackets", "winter wear", 99.99, 29),
("bluetooth speaker", "electronics", 4.99, 2),
("shirt", "men's wear", 15.99, 1),
("puzzle game", "kids toys", 9.99, 0),
("screw driver set", "tools", 14.49, 4)


