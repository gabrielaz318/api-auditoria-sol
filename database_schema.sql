CREATE DATABASE  IF NOT EXISTS `auditoria_sol`
USE `auditoria_sol`;


DROP TABLE IF EXISTS `checklists`;

CREATE TABLE `checklists` (
  `id` int NOT NULL AUTO_INCREMENT,
  `checklist` longtext NOT NULL,
  PRIMARY KEY (`id`)
);


DROP TABLE IF EXISTS `setores`;

CREATE TABLE `setores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `setor` varchar(128) NOT NULL,
  `ativo` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `setor_UNIQUE` (`setor`)
);


DROP TABLE IF EXISTS `usuarios`;

CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(128) DEFAULT NULL,
  `usuario` varchar(32) DEFAULT NULL,
  `senha` varchar(128) DEFAULT NULL,
  `ativo` int NOT NULL DEFAULT '1',
  `dh_criacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);


DROP TABLE IF EXISTS `registros`;

CREATE TABLE `registros` (
  `id` int NOT NULL AUTO_INCREMENT,
  `criador` int NOT NULL,
  `setor` int NOT NULL,
  `checklist` text,
  `status` int DEFAULT NULL,
  `ativo` int NOT NULL DEFAULT '1',
  `dh_criacao` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `criador` (`criador`),
  KEY `setor` (`setor`),
  CONSTRAINT `registros_ibfk_1` FOREIGN KEY (`criador`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `registros_ibfk_2` FOREIGN KEY (`setor`) REFERENCES `setores` (`id`)
);


DROP TABLE IF EXISTS `ocorrencias`;

CREATE TABLE `ocorrencias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `registro` int NOT NULL,
  `comentario` text NOT NULL,
  `foto` longtext NOT NULL,
  `dh_criacao` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `registro` (`registro`),
  CONSTRAINT `ocorrencias_ibfk_1` FOREIGN KEY (`registro`) REFERENCES `registros` (`id`)
);