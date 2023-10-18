CREATE DATABASE joyas;

CREATE TABLE inventario (
  id            SERIAL          NOT NULL,
  nombre        VARCHAR(50)     NOT NULL,
  categoria     VARCHAR(50)     NOT NULL,
  metal         VARCHAR(50)     NOT NULL,
  precio        DECIMAL(10, 2)  NOT NULL,
  stock         INT             NOT NULL,
  PRIMARY KEY (id)
);

INSERT INTO inventario VALUES
(DEFAULT, 'Collar Heart', 'collar', 'oro', 20000.00, 2),
(DEFAULT, 'Collar History', 'collar', 'plata', 15000.00, 5),
(DEFAULT, 'Aros Berry', 'aros', 'oro', 12000.00, 10),
(DEFAULT, 'Aros Hook Blue', 'aros', 'oro', 25000.00, 4),
(DEFAULT, 'Anillo Wish', 'anillo', 'plata', 30000.00, 4),
(DEFAULT, 'Anillo Cuarzo Greece', 'anillo', 'oro', 40000.00, 2);
