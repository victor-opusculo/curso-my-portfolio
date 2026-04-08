import { relations } from "drizzle-orm/relations";
import { media, projects, projectsTags, projectsAttachs, tools, projectsTools, blogPosts, blogPostsTags } from "./schema";

export const projectsRelations = relations(projects, ({one, many}) => ({
	media: one(media, {
		fields: [projects.logoMediaId],
		references: [media.id]
	}),
	projectsTags: many(projectsTags),
	projectsAttachs: many(projectsAttachs),
	projectsTools: many(projectsTools),
}));

export const mediaRelations = relations(media, ({many}) => ({
	projects: many(projects),
	projectsAttachs: many(projectsAttachs),
	tools: many(tools),
}));

export const projectsTagsRelations = relations(projectsTags, ({one}) => ({
	project: one(projects, {
		fields: [projectsTags.projId],
		references: [projects.id]
	}),
}));

export const projectsAttachsRelations = relations(projectsAttachs, ({one}) => ({
	media: one(media, {
		fields: [projectsAttachs.mediaId],
		references: [media.id]
	}),
	project: one(projects, {
		fields: [projectsAttachs.projId],
		references: [projects.id]
	}),
}));

export const toolsRelations = relations(tools, ({one, many}) => ({
	media: one(media, {
		fields: [tools.logoMediaId],
		references: [media.id]
	}),
	projectsTools: many(projectsTools),
}));

export const projectsToolsRelations = relations(projectsTools, ({one}) => ({
	tool: one(tools, {
		fields: [projectsTools.toolId],
		references: [tools.id]
	}),
	project: one(projects, {
		fields: [projectsTools.projId],
		references: [projects.id]
	}),
}));

export const blogPostsTagsRelations = relations(blogPostsTags, ({one}) => ({
	blogPost: one(blogPosts, {
		fields: [blogPostsTags.postId],
		references: [blogPosts.id]
	}),
}));

export const blogPostsRelations = relations(blogPosts, ({many}) => ({
	blogPostsTags: many(blogPostsTags),
}));