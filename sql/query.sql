-- Part 3 — find all customer names and countries that used "United Package" as their shipper.
-- Verified live in the W3Schools SQL Try-It editor (Northwind sample DB): 45 rows returned.
SELECT DISTINCT Customers.CustomerName, Customers.Country
FROM Customers
INNER JOIN Orders ON Customers.CustomerID = Orders.CustomerID
INNER JOIN Shippers ON Orders.ShipperID = Shippers.ShipperID
WHERE Shippers.ShipperName = 'United Package';
