CREATE TABLE `blogpost` (
	`id` int AUTO_INCREMENT NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp DEFAULT NULL,
	`shortname` varchar(255),
	`title` varchar(255),
	`summary` varchar(255),
	`image` varchar(255),
	`category` varchar(255),
	`publish_date` date,
	`published` boolean,
	CONSTRAINT `blogpost_id` PRIMARY KEY(`id`),
	CONSTRAINT `shortname_unique` UNIQUE(`shortname`)
);
