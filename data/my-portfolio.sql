
CREATE TABLE settings
(
    `key` TEXT NOT NULL PRIMARY KEY,
    `value` TEXT NULL
);

INSERT INTO settings (key, value) VALUES ('admin_username', 'victor');
INSERT INTO settings (key, value) VALUES ('admin_password_hash', '$2b$10$CLUsc9mV7VSF5AKI/5RDuOWgZA5.9J1rTHEKl38tgrSISdRXaKD.S');

INSERT INTO settings (key, value) VALUES ('homepage_blog_post_id', NULL);
INSERT INTO settings (key, value) VALUES ('contact_email', 'example@example.com');
INSERT INTO settings (key, value) VALUES ('contact_phone', '+55 (11) 999-999-999');

----------- Medias -----------

CREATE TABLE media
(
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_extension TEXT NULL
);

CREATE VIRTUAL TABLE media_fts USING fts5(title, content='media', content_rowid='id', tokenize = "unicode61 tokenchars '-_'");
CREATE TRIGGER media_insert AFTER INSERT ON media BEGIN
    INSERT INTO media_fts (rowid, title) VALUES (new.id, new.title);
END;

CREATE TRIGGER media_update AFTER UPDATE ON media BEGIN
    INSERT INTO media_fts (rowid, title) VALUES (new.id, new.title);
END;

CREATE TRIGGER media_delete AFTER DELETE ON media BEGIN
    DELETE FROM media_fts WHERE rowid = old.id;
END;

----------- Projects -----------
CREATE TABLE projects
(
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NULL,
    links_json TEXT NOT NULL DEFAULT ('[]'),
    logo_media_id INTEGER NULL,

    FOREIGN KEY (logo_media_id) REFERENCES media(id) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE VIRTUAL TABLE projects_fts USING fts5(title, description, content='projects', content_rowid='id', tokenize="unicode61 tokenchars '-_'");
CREATE TRIGGER projects_insert AFTER INSERT ON projects BEGIN
    INSERT INTO projects_fts (rowid, title, description) VALUES (new.id, new.title, new.description);
    INSERT INTO projects_tags_fts (rowid, tags) VALUES (new.id, '');
END;

CREATE TRIGGER projects_update AFTER UPDATE ON projects BEGIN
    INSERT INTO projects_fts (rowid, title, description) VALUES (new.id, new.title, new.description);
END;

CREATE TRIGGER projects_delete AFTER DELETE ON projects BEGIN
    DELETE FROM projects_fts WHERE rowid = old.id;
    DELETE FROM projects_tags_fts WHERE rowid = old.id;
END;

CREATE TABLE projects_tags
(
    proj_id INTEGER NOT NULL,
    tag TEXT NOT NULL,

    PRIMARY KEY (proj_id, tag),
    FOREIGN KEY (proj_id) REFERENCES projects(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE VIRTUAL TABLE projects_tags_fts USING fts5(tags, tokenize="unicode61 tokenchars '-_'");
CREATE TRIGGER projects_tags_insert AFTER INSERT ON projects_tags BEGIN
    UPDATE projects_tags_fts SET tags = (SELECT group_concat(tag, ' ') FROM projects_tags WHERE projects_tags.proj_id = new.proj_id) WHERE projects_tags_fts.rowid = new.proj_id;
END;

CREATE TRIGGER project_tags_update AFTER UPDATE ON projects_tags BEGIN
    UPDATE projects_tags_fts SET tags = (SELECT group_concat(tag, ' ') FROM projects_tags WHERE projects_tags.proj_id = new.proj_id) WHERE projects_tags_fts.rowid = new.proj_id;
END;

CREATE TRIGGER projects_tags_delete AFTER DELETE ON projects_tags BEGIN
    UPDATE projects_tags_fts SET tags = (SELECT group_concat(tag, ' ') FROM projects_tags WHERE projects_tags.proj_id = old.proj_id) WHERE projects_tags_fts.rowid = old.proj_id;
END;

CREATE TABLE projects_attachs
(
    proj_id INTEGER NOT NULL,
    media_id INTEGER NOT NULL,
    is_gallery INTEGER NOT NULL DEFAULT (0),

    PRIMARY KEY (proj_id, media_id),
    FOREIGN KEY (proj_id) REFERENCES projects(id) ON DELETE CASCADE ON UPDATE CASCADE
    FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE ON UPDATE CASCADE
);

----------- Tools ------------

CREATE TABLE tools
(
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NULL,
    logo_media_id INTEGER NULL,

    FOREIGN KEY (logo_media_id) REFERENCES media(id) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE projects_tools
(
    proj_id INTEGER NOT NULL,
    tool_id INTEGER NOT NULL,

    PRIMARY KEY (proj_id, tool_id),
    FOREIGN KEY (proj_id) REFERENCES projects(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE VIRTUAL TABLE tools_fts USING fts5(title, description, content='tools', content_rowid='id', tokenize="unicode61 tokenchars '-_'");
CREATE TRIGGER tools_insert AFTER INSERT ON tools BEGIN
    INSERT INTO tools_fts (rowid, title, description) VALUES (new.id, new.title, new.description);
END;

CREATE TRIGGER tools_update AFTER UPDATE ON tools BEGIN
    INSERT INTO tools_fts (rowid, title, description) VALUES (new.id, new.title, new.description);
END;

CREATE TRIGGER tools_delete AFTER DELETE ON tools BEGIN
    DELETE FROM tools_fts WHERE rowid = old.id;
END;

------------- Blog -----------------

CREATE TABLE blog_posts
(
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    enable_html INTEGER NOT NULL DEFAULT(0),
    is_visible INTEGER NOT NULL DEFAULT(1),

    published_at_utc TEXT NULL,
    updated_at_utc TEXT NULL
);

CREATE TABLE blog_posts_tags
(
    post_id INTEGER NOT NULL,
    tag TEXT NOT NULL,

    PRIMARY KEY (post_id, tag),
    FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TRIGGER insert_timestamp_on_blog_posts AFTER INSERT ON blog_posts
BEGIN
    UPDATE blog_posts SET published_at_utc = CURRENT_TIMESTAMP, updated_at_utc = CURRENT_TIMESTAMP WHERE rowid = new.id;
END;

CREATE TRIGGER update_timestamp_on_blog_posts AFTER UPDATE ON blog_posts 
BEGIN
    UPDATE blog_posts
    SET updated_at_utc = CURRENT_TIMESTAMP
    WHERE id = new.id;
END;

CREATE VIRTUAL TABLE blog_posts_fts USING fts5(title, content, tokenize="unicode61 tokenchars '-_'", content='blog_posts', content_rowid='id');
CREATE VIRTUAL TABLE blog_posts_tags_fts USING fts5(tags, tokenize="unicode61 tokenchars '-_'");

CREATE TRIGGER blog_posts_insert AFTER INSERT ON blog_posts BEGIN
    INSERT INTO blog_posts_fts (rowid, title, content) VALUES (new.id, new.title, new.content);
    INSERT INTO blog_posts_tags_fts (rowid, tags) VALUES (new.id, '');
END;

CREATE TRIGGER blog_posts_update AFTER UPDATE ON blog_posts BEGIN
    INSERT INTO blog_posts_fts (rowid, title, content) VALUES (new.id, new.title, new.content);
END;

CREATE TRIGGER blog_posts_delete AFTER DELETE ON blog_posts BEGIN
    DELETE FROM blog_posts_fts WHERE rowid = old.id;
    DELETE FROM blog_posts_tags_fts WHERE rowid = old.id;
END;

CREATE TRIGGER blog_posts_tags_insert AFTER INSERT ON blog_posts_tags BEGIN
    UPDATE blog_posts_tags_fts SET tags = (SELECT group_concat(tag, ' ') FROM blog_posts_tags WHERE blog_posts_tags.post_id = new.post_id) WHERE blog_posts_tags_fts.rowid = new.post_id;
END;

CREATE TRIGGER blog_posts_tags_update AFTER UPDATE ON blog_posts_tags BEGIN
    UPDATE blog_posts_tags_fts SET tags = (SELECT group_concat(tag, ' ') FROM blog_posts_tags WHERE blog_posts_tags.post_id = new.post_id) WHERE blog_posts_tags_fts.rowid = new.post_id;
END;

CREATE TRIGGER blog_posts_tags_delete BEFORE DELETE ON blog_posts_tags BEGIN
    UPDATE blog_posts_tags_fts SET tags = (SELECT group_concat(tag, ' ') FROM blog_posts_tags WHERE blog_posts_tags.post_id = old.post_id) WHERE blog_posts_tags_fts.rowid = old.post_id;
END;