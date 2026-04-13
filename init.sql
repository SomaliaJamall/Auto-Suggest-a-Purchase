CREATE TABLE IF NOT EXISTS title_requests (
  id int AUTO_INCREMENT PRIMARY KEY,
  barcode varchar(32) NOT NULL,
  title varchar(256) NOT NULL,
  author varchar(256) DEFAULT NULL,
  identifier varchar(32) DEFAULT NULL,
  publication varchar(16) DEFAULT NULL,
  autohold tinyint NOT NULL DEFAULT '0',
  status tinyint NOT NULL DEFAULT '1',
  email varchar(256) NOT NULL,
  created DATETIME DEFAULT NOW(), 
  agegroup tinyint NOT NULL DEFAULT '0',
  format tinyint NOT NULL DEFAULT '0',
  editedBy varchar(256) DEFAULT NULL,
  notes varchar(1000) NOT NULL,
  bibid varchar(1000) NULL
);