-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: kpishka
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `folders`
--

DROP TABLE IF EXISTS `folders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `folders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `folders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `folders`
--

LOCK TABLES `folders` WRITE;
/*!40000 ALTER TABLE `folders` DISABLE KEYS */;
INSERT INTO `folders` VALUES (1,1,'Продукти'),(2,3,'Папка №1'),(3,3,'Ще одна папка №2');
/*!40000 ALTER TABLE `folders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mitca`
--

DROP TABLE IF EXISTS `mitca`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mitca` (
  `id` int NOT NULL AUTO_INCREMENT,
  `note_id` int NOT NULL,
  `task_text` varchar(255) NOT NULL,
  `is_done` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `fk_note` (`note_id`),
  CONSTRAINT `fk_note` FOREIGN KEY (`note_id`) REFERENCES `notes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=95 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mitca`
--

LOCK TABLES `mitca` WRITE;
/*!40000 ALTER TABLE `mitca` DISABLE KEYS */;
INSERT INTO `mitca` VALUES (35,3,'молоко',1),(36,3,'3',1),(37,3,'???',1),(72,2,'1',1),(73,2,'3',1),(74,2,'5',1),(81,14,'[object Object]',0),(82,14,'[object Object]',0),(83,14,'[object Object]',0),(92,15,'1',1),(93,15,'3',1),(94,8,'Молоко',0);
/*!40000 ALTER TABLE `mitca` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notes`
--

DROP TABLE IF EXISTS `notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(100) DEFAULT '',
  `content` text,
  `priority` int DEFAULT '1',
  `archived` tinyint(1) DEFAULT '0',
  `created` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `folder_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_user` (`user_id`),
  KEY `folder_id` (`folder_id`),
  CONSTRAINT `fk_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `notes_ibfk_1` FOREIGN KEY (`folder_id`) REFERENCES `folders` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notes`
--

LOCK TABLES `notes` WRITE;
/*!40000 ALTER TABLE `notes` DISABLE KEYS */;
INSERT INTO `notes` VALUES (1,1,'Тест 1','Провірю я текст новий',1,0,'2026-05-07 17:01:46','2026-05-08 09:41:51',NULL),(2,1,'Тест №2','',2,0,'2026-05-07 17:02:06','2026-05-08 10:16:48',NULL),(3,1,'Тест №3','',3,1,'2026-05-07 17:03:27','2026-05-08 09:49:54',NULL),(4,1,'123','12345',2,0,'2026-05-07 17:08:39','2026-05-08 09:42:13',NULL),(7,1,'№5','1234567',3,0,'2026-05-08 10:17:00','2026-05-12 17:34:49',NULL),(8,1,'№6','',1,0,'2026-05-08 20:00:19','2026-05-08 20:00:19',1),(9,1,'Тест!@#$%^&*(','провірим видалення',2,0,'2026-05-12 17:35:23','2026-05-13 15:21:06',1),(10,3,'#1','Нотатка 1',1,0,'2026-05-13 11:11:01','2026-05-13 11:11:01',NULL),(11,3,'№2','Нотатка номер два',1,0,'2026-05-13 11:11:12','2026-05-13 11:11:12',NULL),(12,3,'№3','Нотатка номер 3\n',2,1,'2026-05-13 11:11:26','2026-05-13 11:18:34',NULL),(13,3,'4','Нотатка 4',3,0,'2026-05-13 11:11:38','2026-05-13 11:11:38',NULL),(14,3,'5(чек лист)','',3,0,'2026-05-13 11:12:00','2026-05-13 11:12:00',NULL),(15,3,'6(чек лист)','',3,0,'2026-05-13 11:16:11','2026-05-13 11:16:24',NULL);
/*!40000 ALTER TABLE `notes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'sergey','$2b$10$I.eAWbw0350xv69vF714IOx4W2gPY4LGIOH3MhDOC.BrCy2jbEITe','2026-05-07 16:31:06'),(2,'sergey2','$2b$10$pBTA0gW7uLcFmypQlsTBa..3.V6Zs5AxTK4ax.SoacuYwRrrpOx96','2026-05-07 17:39:53'),(3,'SERGO','$2b$10$.esElD8QmR5ZRt215XEDgubkiJi7uyqymV0JWNMMCLhuekTAZ6mXa','2026-05-07 17:41:56'),(4,'SERGO_','$2b$10$R1X7XBiSNntIeme13MXroeCk6viWGZK.oxz0LU4I7CHPnf0cQndv.','2026-05-13 11:07:51');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-14 20:41:13
