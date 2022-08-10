CREATE DATABASE IF NOT EXISTS tracktube;

USE tracktube;

CREATE TABLE IF NOT EXISTS users (
	user_id INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(20) NOT NULL,
    password VARCHAR(100) NOT NULL,
    admin_pass VARCHAR(100),
    PRIMARY KEY(user_id)
);

CREATE TABLE IF NOT EXISTS podcasts (
	podcast_id VARCHAR(4) NOT NULL,
    video_id VARCHAR(11) NOT NULL,
    definition VARCHAR(5) NOT NULL,
    title VARCHAR(500) NOT NULL,
    duration TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    published TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(podcast_id)
);

CREATE TABLE IF NOT EXISTS tracks (
	track_id INT NOT NULL AUTO_INCREMENT,
    podcast_id VARCHAR(11) NOT NULL,
    track_date DATE NOT NULL,
    track_time TIME NOT NULL,
    likes INT NOT NULL,
    views INT NOT NULL,
    PRIMARY KEY(track_id),
    FOREIGN KEY(podcast_id) REFERENCES podcasts(podcast_id)
);