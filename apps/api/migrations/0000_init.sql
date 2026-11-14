CREATE TABLE `bills` (
	`id` text PRIMARY KEY NOT NULL,
	`date` integer NOT NULL,
	`type` text NOT NULL,
	`amount` integer NOT NULL,
	`description` text NOT NULL,
	`remarks` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	CONSTRAINT "bills_type_check" CHECK("bills"."type" IN ('expense', 'income')),
	CONSTRAINT "bills_amount_check" CHECK("bills"."amount" > 0)
);
--> statement-breakpoint
CREATE INDEX `bills_date_idx` ON `bills` (`date`);--> statement-breakpoint
CREATE INDEX `bills_type_date_idx` ON `bills` (`type`,`date`);--> statement-breakpoint
CREATE TABLE `cheques` (
	`id` text PRIMARY KEY NOT NULL,
	`serial` integer NOT NULL,
	`due_date` integer NOT NULL,
	`value` integer NOT NULL,
	`remarks` text,
	`payee_id` text,
	`is_cancelled` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`payee_id`) REFERENCES `payees`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cheques_serial_unique` ON `cheques` (`serial`);--> statement-breakpoint
CREATE INDEX `cheques_due_date_serial_idx` ON `cheques` (`due_date`,`serial`);--> statement-breakpoint
CREATE INDEX `cheques_payee_id_idx` ON `cheques` (`payee_id`);--> statement-breakpoint
CREATE TABLE `login_attempts` (
	`key` text NOT NULL,
	`window_start` integer NOT NULL,
	`count` integer NOT NULL,
	PRIMARY KEY(`key`, `window_start`)
);
--> statement-breakpoint
CREATE TABLE `logs` (
	`id` text PRIMARY KEY NOT NULL,
	`worker_id` text NOT NULL,
	`date` integer NOT NULL,
	`is_absent` integer DEFAULT false NOT NULL,
	`starting_time` text,
	`finishing_time` text,
	`otv` real DEFAULT 0 NOT NULL,
	`payment` integer DEFAULT 0 NOT NULL,
	`remarks` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`worker_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `logs_date_worker_id_unique` ON `logs` (`date`,`worker_id`);--> statement-breakpoint
CREATE INDEX `logs_worker_id_idx` ON `logs` (`worker_id`);--> statement-breakpoint
CREATE TABLE `payees` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`phone_number` text,
	`remarks` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payees_name_unique` ON `payees` (`name`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`refresh_token_hash` text NOT NULL,
	`ip_address` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_refresh_token_hash_unique` ON `sessions` (`refresh_token_hash`);--> statement-breakpoint
CREATE INDEX `sessions_expires_at_idx` ON `sessions` (`expires_at`);--> statement-breakpoint
CREATE INDEX `sessions_user_id_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`username` text NOT NULL,
	`email` text,
	`phone_number` text,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'User' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`theme` text DEFAULT 'system' NOT NULL,
	`language` text DEFAULT 'ar' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	CONSTRAINT "users_role_check" CHECK("users"."role" IN ('User', 'Spectator', 'Moderator', 'Administrator'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);