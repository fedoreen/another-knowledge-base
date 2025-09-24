-- User roles enum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- Users table
CREATE TABLE "user" (
	id TEXT NOT NULL,
	email TEXT NOT NULL,
	password_hash TEXT NOT NULL,
	name TEXT,
	role "UserRole" NOT NULL DEFAULT 'USER',
	created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP(3) NOT NULL,

	CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- Articles table
CREATE TABLE article (
	id TEXT NOT NULL,
	title TEXT NOT NULL,
	content TEXT NOT NULL,
	tags TEXT[] DEFAULT ARRAY[]::TEXT[],
	is_public BOOLEAN NOT NULL DEFAULT false,
	author_id TEXT NOT NULL,
	created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP(3) NOT NULL,

	CONSTRAINT article_pkey PRIMARY KEY (id)
);

-- User email unique index
CREATE UNIQUE INDEX user_email_key ON "user"(email);

-- Article author foreign key
ALTER TABLE article ADD CONSTRAINT article_author_id_fkey FOREIGN KEY (author_id) REFERENCES "user"(id) ON DELETE CASCADE ON UPDATE CASCADE;
