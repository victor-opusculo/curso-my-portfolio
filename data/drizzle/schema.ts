import { sqliteTable, AnySQLiteColumn, text, integer, numeric, blob, primaryKey, foreignKey } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const settings = sqliteTable("settings", {
	key: text().primaryKey().notNull(),
	value: text(),
});

export const media = sqliteTable("media", {
	id: integer().primaryKey(),
	title: text().notNull(),
	mimeType: text("mime_type").notNull(),
	fileExtension: text("file_extension"),
});

export const mediaFts = sqliteTable("media_fts", {
	title: numeric(),
	mediaFts: numeric("media_fts"),
	rank: numeric(),
});

export const mediaFtsData = sqliteTable("media_fts_data", {
	id: integer().primaryKey(),
	block: blob(),
});

export const mediaFtsIdx = sqliteTable("media_fts_idx", {
	segid: numeric().notNull(),
	term: numeric().notNull(),
	pgno: numeric(),
},
(table) => [
	primaryKey({ columns: [table.segid, table.term], name: "media_fts_idx_segid_term_pk"})
]);

export const mediaFtsDocsize = sqliteTable("media_fts_docsize", {
	id: integer().primaryKey(),
	sz: blob(),
});

export const mediaFtsConfig = sqliteTable("media_fts_config", {
	k: numeric().primaryKey().notNull(),
	v: numeric(),
});

export const projects = sqliteTable("projects", {
	id: integer().primaryKey(),
	title: text().notNull(),
	description: text(),
	linksJson: text("links_json").default("[]").notNull(),
	logoMediaId: integer("logo_media_id").references(() => media.id, { onDelete: "set null", onUpdate: "cascade" } ),
});

export const projectsFts = sqliteTable("projects_fts", {
	title: numeric(),
	description: numeric(),
	projectsFts: numeric("projects_fts"),
	rank: numeric(),
});

export const projectsFtsData = sqliteTable("projects_fts_data", {
	id: integer().primaryKey(),
	block: blob(),
});

export const projectsFtsIdx = sqliteTable("projects_fts_idx", {
	segid: numeric().notNull(),
	term: numeric().notNull(),
	pgno: numeric(),
},
(table) => [
	primaryKey({ columns: [table.segid, table.term], name: "projects_fts_idx_segid_term_pk"})
]);

export const projectsFtsDocsize = sqliteTable("projects_fts_docsize", {
	id: integer().primaryKey(),
	sz: blob(),
});

export const projectsFtsConfig = sqliteTable("projects_fts_config", {
	k: numeric().primaryKey().notNull(),
	v: numeric(),
});

export const projectsTags = sqliteTable("projects_tags", {
	projId: integer("proj_id").notNull().references(() => projects.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	tag: text().notNull(),
},
(table) => [
	primaryKey({ columns: [table.projId, table.tag], name: "projects_tags_proj_id_tag_pk"})
]);

export const projectsTagsFts = sqliteTable("projects_tags_fts", {
	tags: numeric(),
	projectsTagsFts: numeric("projects_tags_fts"),
	rank: numeric(),
});

export const projectsTagsFtsData = sqliteTable("projects_tags_fts_data", {
	id: integer().primaryKey(),
	block: blob(),
});

export const projectsTagsFtsIdx = sqliteTable("projects_tags_fts_idx", {
	segid: numeric().notNull(),
	term: numeric().notNull(),
	pgno: numeric(),
},
(table) => [
	primaryKey({ columns: [table.segid, table.term], name: "projects_tags_fts_idx_segid_term_pk"})
]);

export const projectsTagsFtsContent = sqliteTable("projects_tags_fts_content", {
	id: integer().primaryKey(),
	c0: numeric(),
});

export const projectsTagsFtsDocsize = sqliteTable("projects_tags_fts_docsize", {
	id: integer().primaryKey(),
	sz: blob(),
});

export const projectsTagsFtsConfig = sqliteTable("projects_tags_fts_config", {
	k: numeric().primaryKey().notNull(),
	v: numeric(),
});

export const projectsAttachs = sqliteTable("projects_attachs", {
	projId: integer("proj_id").notNull().references(() => projects.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	mediaId: integer("media_id").notNull().references(() => media.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	isGallery: integer("is_gallery").default(0).notNull(),
},
(table) => [
	primaryKey({ columns: [table.projId, table.mediaId], name: "projects_attachs_proj_id_media_id_pk"})
]);

export const tools = sqliteTable("tools", {
	id: integer().primaryKey(),
	title: text().notNull(),
	description: text(),
	logoMediaId: integer("logo_media_id").references(() => media.id, { onDelete: "set null", onUpdate: "cascade" } ),
});

export const projectsTools = sqliteTable("projects_tools", {
	projId: integer("proj_id").notNull().references(() => projects.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	toolId: integer("tool_id").notNull().references(() => tools.id, { onDelete: "cascade", onUpdate: "cascade" } ),
},
(table) => [
	primaryKey({ columns: [table.projId, table.toolId], name: "projects_tools_proj_id_tool_id_pk"})
]);

export const toolsFts = sqliteTable("tools_fts", {
	title: numeric(),
	description: numeric(),
	toolsFts: numeric("tools_fts"),
	rank: numeric(),
});

export const toolsFtsData = sqliteTable("tools_fts_data", {
	id: integer().primaryKey(),
	block: blob(),
});

export const toolsFtsIdx = sqliteTable("tools_fts_idx", {
	segid: numeric().notNull(),
	term: numeric().notNull(),
	pgno: numeric(),
},
(table) => [
	primaryKey({ columns: [table.segid, table.term], name: "tools_fts_idx_segid_term_pk"})
]);

export const toolsFtsDocsize = sqliteTable("tools_fts_docsize", {
	id: integer().primaryKey(),
	sz: blob(),
});

export const toolsFtsConfig = sqliteTable("tools_fts_config", {
	k: numeric().primaryKey().notNull(),
	v: numeric(),
});

export const blogPosts = sqliteTable("blog_posts", {
	id: integer().primaryKey(),
	title: text().notNull(),
	content: text().notNull(),
	enableHtml: integer("enable_html").default(0).notNull(),
	isVisible: integer("is_visible").default(1).notNull(),
	publishedAtUtc: text("published_at_utc"),
	updatedAtUtc: text("updated_at_utc"),
});

export const blogPostsTags = sqliteTable("blog_posts_tags", {
	postId: integer("post_id").notNull().references(() => blogPosts.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	tag: text().notNull(),
},
(table) => [
	primaryKey({ columns: [table.postId, table.tag], name: "blog_posts_tags_post_id_tag_pk"})
]);

export const blogPostsFts = sqliteTable("blog_posts_fts", {
	title: numeric(),
	content: numeric(),
	blogPostsFts: numeric("blog_posts_fts"),
	rank: numeric(),
});

export const blogPostsFtsData = sqliteTable("blog_posts_fts_data", {
	id: integer().primaryKey(),
	block: blob(),
});

export const blogPostsFtsIdx = sqliteTable("blog_posts_fts_idx", {
	segid: numeric().notNull(),
	term: numeric().notNull(),
	pgno: numeric(),
},
(table) => [
	primaryKey({ columns: [table.segid, table.term], name: "blog_posts_fts_idx_segid_term_pk"})
]);

export const blogPostsFtsDocsize = sqliteTable("blog_posts_fts_docsize", {
	id: integer().primaryKey(),
	sz: blob(),
});

export const blogPostsFtsConfig = sqliteTable("blog_posts_fts_config", {
	k: numeric().primaryKey().notNull(),
	v: numeric(),
});

export const blogPostsTagsFts = sqliteTable("blog_posts_tags_fts", {
	tags: numeric(),
	blogPostsTagsFts: numeric("blog_posts_tags_fts"),
	rank: numeric(),
});

export const blogPostsTagsFtsData = sqliteTable("blog_posts_tags_fts_data", {
	id: integer().primaryKey(),
	block: blob(),
});

export const blogPostsTagsFtsIdx = sqliteTable("blog_posts_tags_fts_idx", {
	segid: numeric().notNull(),
	term: numeric().notNull(),
	pgno: numeric(),
},
(table) => [
	primaryKey({ columns: [table.segid, table.term], name: "blog_posts_tags_fts_idx_segid_term_pk"})
]);

export const blogPostsTagsFtsContent = sqliteTable("blog_posts_tags_fts_content", {
	id: integer().primaryKey(),
	c0: numeric(),
});

export const blogPostsTagsFtsDocsize = sqliteTable("blog_posts_tags_fts_docsize", {
	id: integer().primaryKey(),
	sz: blob(),
});

export const blogPostsTagsFtsConfig = sqliteTable("blog_posts_tags_fts_config", {
	k: numeric().primaryKey().notNull(),
	v: numeric(),
});

