CREATE TABLE `blog`.`complaints` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `url` VARCHAR(255) NOT NULL,
  `created` DATETIME NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `seen` TINYINT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE);
