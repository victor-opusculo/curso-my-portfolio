-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text
);
--> statement-breakpoint
CREATE TABLE `media` (
	`id` integer PRIMARY KEY,
	`title` text NOT NULL,
	`mime_type` text NOT NULL,
	`file_extension` text
);
--> statement-breakpoint
CREATE TABLE `media_fts` (
	`title` numeric,
	`media_fts` numeric,
	`rank` numeric
);
--> statement-breakpoint
CREATE TABLE `media_fts_data` (
	`id` integer PRIMARY KEY,
	`block` blob
);
--> statement-breakpoint
CREATE TABLE `media_fts_idx` (
	`segid` numeric NOT NULL,
	`term` numeric NOT NULL,
	`pgno` numeric,
	PRIMARY KEY(`segid`, `term`)
);
--> statement-breakpoint
CREATE TABLE `media_fts_docsize` (
	`id` integer PRIMARY KEY,
	`sz` blob
);
--> statement-breakpoint
CREATE TABLE `media_fts_config` (
	`k` numeric PRIMARY KEY NOT NULL,
	`v` numeric
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` integer PRIMARY KEY,
	`title` text NOT NULL,
	`description` text,
	`links_json` text DEFAULT '[]' NOT NULL,
	`logo_media_id` integer,
	FOREIGN KEY (`logo_media_id`) REFERENCES `media`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `projects_fts` (
	`title` numeric,
	`description` numeric,
	`projects_fts` numeric,
	`rank` numeric
);
--> statement-breakpoint
CREATE TABLE `projects_fts_data` (
	`id` integer PRIMARY KEY,
	`block` blob
);
--> statement-breakpoint
CREATE TABLE `projects_fts_idx` (
	`segid` numeric NOT NULL,
	`term` numeric NOT NULL,
	`pgno` numeric,
	PRIMARY KEY(`segid`, `term`)
);
--> statement-breakpoint
CREATE TABLE `projects_fts_docsize` (
	`id` integer PRIMARY KEY,
	`sz` blob
);
--> statement-breakpoint
CREATE TABLE `projects_fts_config` (
	`k` numeric PRIMARY KEY NOT NULL,
	`v` numeric
);
--> statement-breakpoint
CREATE TABLE `projects_tags` (
	`proj_id` integer NOT NULL,
	`tag` text NOT NULL,
	PRIMARY KEY(`proj_id`, `tag`),
	FOREIGN KEY (`proj_id`) REFERENCES `projects`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `projects_tags_fts` (
	`tags` numeric,
	`projects_tags_fts` numeric,
	`rank` numeric
);
--> statement-breakpoint
CREATE TABLE `projects_tags_fts_data` (
	`id` integer PRIMARY KEY,
	`block` blob
);
--> statement-breakpoint
CREATE TABLE `projects_tags_fts_idx` (
	`segid` numeric NOT NULL,
	`term` numeric NOT NULL,
	`pgno` numeric,
	PRIMARY KEY(`segid`, `term`)
);
--> statement-breakpoint
CREATE TABLE `projects_tags_fts_content` (
	`id` integer PRIMARY KEY,
	`c0` numeric
);
--> statement-breakpoint
CREATE TABLE `projects_tags_fts_docsize` (
	`id` integer PRIMARY KEY,
	`sz` blob
);
--> statement-breakpoint
CREATE TABLE `projects_tags_fts_config` (
	`k` numeric PRIMARY KEY NOT NULL,
	`v` numeric
);
--> statement-breakpoint
CREATE TABLE `projects_attachs` (
	`proj_id` integer NOT NULL,
	`media_id` integer NOT NULL,
	`is_gallery` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`proj_id`, `media_id`),
	FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`proj_id`) REFERENCES `projects`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tools` (
	`id` integer PRIMARY KEY,
	`title` text NOT NULL,
	`description` text,
	`logo_media_id` integer,
	FOREIGN KEY (`logo_media_id`) REFERENCES `media`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `projects_tools` (
	`proj_id` integer NOT NULL,
	`tool_id` integer NOT NULL,
	PRIMARY KEY(`proj_id`, `tool_id`),
	FOREIGN KEY (`tool_id`) REFERENCES `tools`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`proj_id`) REFERENCES `projects`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tools_fts` (
	`title` numeric,
	`description` numeric,
	`tools_fts` numeric,
	`rank` numeric
);
--> statement-breakpoint
CREATE TABLE `tools_fts_data` (
	`id` integer PRIMARY KEY,
	`block` blob
);
--> statement-breakpoint
CREATE TABLE `tools_fts_idx` (
	`segid` numeric NOT NULL,
	`term` numeric NOT NULL,
	`pgno` numeric,
	PRIMARY KEY(`segid`, `term`)
);
--> statement-breakpoint
CREATE TABLE `tools_fts_docsize` (
	`id` integer PRIMARY KEY,
	`sz` blob
);
--> statement-breakpoint
CREATE TABLE `tools_fts_config` (
	`k` numeric PRIMARY KEY NOT NULL,
	`v` numeric
);
--> statement-breakpoint
CREATE TABLE `blog_posts` (
	`id` integer PRIMARY KEY,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`enable_html` integer DEFAULT 0 NOT NULL,
	`is_visible` integer DEFAULT 1 NOT NULL,
	`published_at_utc` text,
	`updated_at_utc` text
);
--> statement-breakpoint
CREATE TABLE `blog_posts_tags` (
	`post_id` integer NOT NULL,
	`tag` text NOT NULL,
	PRIMARY KEY(`post_id`, `tag`),
	FOREIGN KEY (`post_id`) REFERENCES `blog_posts`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `blog_posts_fts` (
	`title` numeric,
	`content` numeric,
	`blog_posts_fts` numeric,
	`rank` numeric
);
--> statement-breakpoint
CREATE TABLE `blog_posts_fts_data` (
	`id` integer PRIMARY KEY,
	`block` blob
);
--> statement-breakpoint
CREATE TABLE `blog_posts_fts_idx` (
	`segid` numeric NOT NULL,
	`term` numeric NOT NULL,
	`pgno` numeric,
	PRIMARY KEY(`segid`, `term`)
);
--> statement-breakpoint
CREATE TABLE `blog_posts_fts_docsize` (
	`id` integer PRIMARY KEY,
	`sz` blob
);
--> statement-breakpoint
CREATE TABLE `blog_posts_fts_config` (
	`k` numeric PRIMARY KEY NOT NULL,
	`v` numeric
);
--> statement-breakpoint
CREATE TABLE `blog_posts_tags_fts` (
	`tags` numeric,
	`blog_posts_tags_fts` numeric,
	`rank` numeric
);
--> statement-breakpoint
CREATE TABLE `blog_posts_tags_fts_data` (
	`id` integer PRIMARY KEY,
	`block` blob
);
--> statement-breakpoint
CREATE TABLE `blog_posts_tags_fts_idx` (
	`segid` numeric NOT NULL,
	`term` numeric NOT NULL,
	`pgno` numeric,
	PRIMARY KEY(`segid`, `term`)
);
--> statement-breakpoint
CREATE TABLE `blog_posts_tags_fts_content` (
	`id` integer PRIMARY KEY,
	`c0` numeric
);
--> statement-breakpoint
CREATE TABLE `blog_posts_tags_fts_docsize` (
	`id` integer PRIMARY KEY,
	`sz` blob
);
--> statement-breakpoint
CREATE TABLE `blog_posts_tags_fts_config` (
	`k` numeric PRIMARY KEY NOT NULL,
	`v` numeric
);

*/