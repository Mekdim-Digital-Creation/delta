-- Delta Print House — MySQL schema
CREATE DATABASE IF NOT EXISTS delta_print_house
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE delta_print_house;

-- ─── Users ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120)  NOT NULL,
  email         VARCHAR(190)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  role          ENUM('customer','admin') NOT NULL DEFAULT 'customer',
  phone         VARCHAR(40)   NULL,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─── Products ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(150)   NOT NULL,
  slug        VARCHAR(160)   NOT NULL UNIQUE,
  description TEXT           NULL,
  category    VARCHAR(80)    NOT NULL,
  price       DECIMAL(12,2)  NOT NULL DEFAULT 0,
  stock       INT            NOT NULL DEFAULT 0,
  unit_label  VARCHAR(40)    NOT NULL DEFAULT 'piece',
  min_qty     INT            NOT NULL DEFAULT 1,
  icon        VARCHAR(60)    NOT NULL DEFAULT 'Printer',
  gradient    VARCHAR(40)    NOT NULL DEFAULT 'cyan',
  image       VARCHAR(500)   NULL,
  active      TINYINT(1)     NOT NULL DEFAULT 1,
  created_at  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_active (active)
) ENGINE=InnoDB;

-- ─── Orders ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  order_no      VARCHAR(20)   NOT NULL UNIQUE,
  user_id       INT           NULL,
  customer_name VARCHAR(120)  NOT NULL,
  customer_email VARCHAR(190) NOT NULL,
  customer_phone VARCHAR(40)  NOT NULL,
  address       VARCHAR(255)  NOT NULL,
  city          VARCHAR(80)   NULL,
  payment_method ENUM('telebirr','cbe_birr','cod') NOT NULL,
  status        ENUM('pending','in_production','ready','delivered','cancelled')
                NOT NULL DEFAULT 'pending',
  total         DECIMAL(12,2) NOT NULL,
  notes         TEXT          NULL,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status)
) ENGINE=InnoDB;

-- ─── Order items ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  order_id     INT           NOT NULL,
  product_id   INT           NULL,
  product_name VARCHAR(150)  NOT NULL,
  unit_price   DECIMAL(12,2) NOT NULL,
  qty          INT           NOT NULL,
  subtotal     DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ─── Contact messages ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_messages (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(120)  NOT NULL,
  email      VARCHAR(190)  NOT NULL,
  phone      VARCHAR(40)   NULL,
  subject    VARCHAR(160)  NOT NULL,
  message    TEXT          NOT NULL,
  status     ENUM('new','read','replied') NOT NULL DEFAULT 'new',
  created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_status (status)
) ENGINE=InnoDB;