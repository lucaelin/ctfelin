CREATE TABLE `posts` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `created` datetime NOT NULL DEFAULT current_timestamp(),
  `updated` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `title` varchar(255) NOT NULL,
  `body` longtext NOT NULL,
  `view_count` int(10) unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;

INSERT INTO `posts` (`title`, `body`, `view_count`)
  VALUES ("My first Post", "I am so excited! I finally managed to create <b>my own blog</b>!<br />I can't wait to get started!", 30);
INSERT INTO `posts` (`title`, `body`)
  VALUES ("Media Upload", "It now also allows images to be uploaded and included in the posts!<br /><img src='/media/first.jpg' width='256' height='258' alt='First Image'></img> This is great!");
