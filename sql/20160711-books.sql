

--

CREATE TABLE `books` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50),
  `title` VARCHAR(100),
  `available` TINYINT(0),
  `created_at` DATETIME,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
