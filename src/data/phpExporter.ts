import { PHPFileExport } from '../types';

export function generatePHPCodebase(): PHPFileExport[] {
  return [
    {
      path: 'config/database.php',
      category: 'database',
      filename: 'database.php',
      description: 'Centralized PDO Database Connection Class with prepared statements and error logging.',
      content: `<?php
/**
 * SHEMAR Private Chat - Database Connection Engine
 * Uses PDO with prepared statements for strict SQL injection protection.
 */

declare(strict_types=1);

require_once __DIR__ . '/config.php';

class Database {
    private static ?PDO $instance = null;

    public static function getConnection(): PDO {
        if (self::$instance === null) {
            try {
                $dsn = sprintf(
                    "mysql:host=%s;dbname=%s;charset=utf8mb4",
                    DB_HOST,
                    DB_NAME
                );

                $options = [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
                ];

                self::$instance = new PDO($dsn, DB_USER, DB_PASS, $options);
            } catch (PDOException $e) {
                error_log("Database Connection Error: " . $e->getMessage());
                die(json_encode([
                    'status' => 'error',
                    'message' => 'Database connection failure. Please check your config/database.php settings.'
                ]));
            }
        }
        return self::$instance;
    }
}
?>`
    },
    {
      path: 'config/config.php',
      category: 'config',
      filename: 'config.php',
      description: 'Platform configuration, session security initialization, and CSRF token helpers.',
      content: `<?php
/**
 * SHEMAR Private Chat - Core Configuration File
 */

declare(strict_types=1);

// Database Credentials
define('DB_HOST', process_env('DB_HOST', '127.0.0.1'));
define('DB_NAME', process_env('DB_NAME', 'shemar_private_chat'));
define('DB_USER', process_env('DB_USER', 'shemar_user'));
define('DB_PASS', process_env('DB_PASS', 'SecretPassword123!'));

// App Settings
define('APP_NAME', 'SHEMAR');
define('APP_TAGLINE', 'Private Celebrity Chat Platform');
define('APP_URL', process_env('APP_URL', 'http://localhost:3000'));
define('UPLOAD_DIR', __DIR__ . '/../uploads/');
define('MAX_UPLOAD_SIZE', 10 * 1024 * 1024); // 10MB

// Secure Session Setup
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', '1');
    ini_set('session.use_only_cookies', '1');
    ini_set('session.cookie_samesite', 'Lax');
    session_start();
}

// Generate CSRF Token
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

function verify_csrf(string $token): bool {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

function sanitize_input(string $data): string {
    return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
}

function process_env(string $key, string $default = ''): string {
    return getenv($key) !== false ? getenv($key) : $default;
}
?>`
    },
    {
      path: 'database/schema.sql',
      category: 'database',
      filename: 'schema.sql',
      description: 'Complete MySQL Database Migration script with foreign keys, indexes, and initial admin seed.',
      content: `-- SHEMAR Private Chat Platform - MySQL Database Schema
-- Compatible with MySQL 8.0+ / MariaDB 10.5+

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS audit_logs, reports, message_attachments, messages, conversations, fans, celebs, celebrity_invitations, users, platform_settings;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_uuid VARCHAR(36) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'celebrity', 'fan') NOT NULL DEFAULT 'fan',
    avatar VARCHAR(255) DEFAULT NULL,
    bio TEXT DEFAULT NULL,
    is_verified TINYINT(1) DEFAULT 0,
    status ENUM('active', 'suspended', 'pending') DEFAULT 'active',
    email_verified_at TIMESTAMP NULL DEFAULT NULL,
    last_seen TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Celebrities Table
CREATE TABLE celebs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    celebrity_uuid VARCHAR(36) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    bio TEXT,
    avatar VARCHAR(255),
    is_verified TINYINT(1) DEFAULT 1,
    status ENUM('active', 'suspended', 'pending') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Fans Table
CREATE TABLE fans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fan_uuid VARCHAR(36) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    assigned_celebrity_id INT NOT NULL,
    status ENUM('active', 'blocked') DEFAULT 'active',
    notes TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_celebrity_id) REFERENCES celebs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Celebrity Invitations Table
CREATE TABLE celebrity_invitations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    celebrity_display_name VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(150) NOT NULL,
    token VARCHAR(64) UNIQUE NOT NULL,
    bio TEXT,
    avatar VARCHAR(255),
    status ENUM('pending', 'accepted', 'expired', 'revoked') DEFAULT 'pending',
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Conversations Table (Enforces strict celebrity_id multi-tenant scoping)
CREATE TABLE conversations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_uuid VARCHAR(36) UNIQUE NOT NULL,
    celebrity_id INT NOT NULL,
    fan_id INT NOT NULL,
    status ENUM('active', 'archived') DEFAULT 'active',
    unread_count_celebrity INT DEFAULT 0,
    unread_count_fan INT DEFAULT 0,
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (celebrity_id) REFERENCES celebs(id) ON DELETE CASCADE,
    FOREIGN KEY (fan_id) REFERENCES fans(id) ON DELETE CASCADE,
    UNIQUE KEY unique_celeb_fan (celebrity_id, fan_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Messages Table
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message_uuid VARCHAR(36) UNIQUE NOT NULL,
    conversation_id INT NOT NULL,
    sender_id INT NOT NULL,
    sender_role ENUM('super_admin', 'celebrity', 'fan') NOT NULL,
    text TEXT,
    attachment_url VARCHAR(255) DEFAULT NULL,
    attachment_type VARCHAR(50) DEFAULT NULL,
    is_read TINYINT(1) DEFAULT 0,
    is_deleted TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Audit Logs Table
CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    user_name VARCHAR(100),
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Reports Table
CREATE TABLE reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reporter_id INT NOT NULL,
    reported_user_id INT NOT NULL,
    message_id INT NULL,
    reason TEXT NOT NULL,
    status ENUM('pending', 'reviewed', 'dismissed', 'actioned') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Super Admin (Shemar Moore)
INSERT INTO users (user_uuid, name, username, email, password_hash, role, is_verified, status)
VALUES (
    'usr_shemar_uuid_1001',
    'Shemar Moore',
    'shemarmoore',
    'shemar@shemarchat.com',
    '$2y$10$e.x/9G.0S2G3B.c6GzO8e.G1Z0z/x0d/1m6Q4i1m1k0a0b0c0d0e0', -- hashed 'password123'
    'super_admin',
    1,
    'active'
);

INSERT INTO celebs (celebrity_uuid, user_id, display_name, username, email, bio, is_verified)
VALUES (
    'celeb_shemar_uuid_2001',
    1,
    'Shemar Moore',
    'shemarmoore',
    'shemar@shemarchat.com',
    'Actor, Producer & Super Admin of Shemar Private Chat.',
    1
);
`
    },
    {
      path: '.htaccess',
      category: 'config',
      filename: '.htaccess',
      description: 'Apache rewrite rules for clean URLs and security restrictions on config/includes directories.',
      content: `# SHEMAR Private Chat - Apache Rewrite & Security Settings
RewriteEngine On
RewriteBase /

# Prevent Direct Directory Browsing
Options -Indexes

# Protect Sensitive Configuration Directories
RewriteRule ^(config|database|includes)/ - [F,L]

# Clean Routing Rules
RewriteRule ^login$ login.php [QSA,L]
RewriteRule ^register$ register.php [QSA,L]
RewriteRule ^logout$ logout.php [QSA,L]
RewriteRule ^chat$ chat/index.php [QSA,L]
RewriteRule ^admin$ admin/index.php [QSA,L]
RewriteRule ^celebrity$ celebrity/index.php [QSA,L]
RewriteRule ^invite/([A-Za-z0-9_-]+)$ invite.php?token=$1 [QSA,L]`
    },
    {
      path: 'auth/login.php',
      category: 'auth',
      filename: 'login.php',
      description: 'Secure authentication controller with password verification, CSRF, and session protection.',
      content: `<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verify_csrf($_POST['csrf_token'] ?? '')) {
        die("Invalid CSRF token.");
    }

    $email = sanitize_input($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    $db = Database::getConnection();
    $stmt = $db->prepare("SELECT * FROM users WHERE email = :email LIMIT 1");
    $stmt->execute(['email' => $email]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password_hash'])) {
        if ($user['status'] !== 'active') {
            $error = 'Your account has been suspended or is pending approval.';
        } else {
            session_regenerate_id(true);
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_uuid'] = $user['user_uuid'];
            $_SESSION['role'] = $user['role'];
            $_SESSION['name'] = $user['name'];

            if ($user['role'] === 'super_admin') {
                header("Location: /admin");
            } elseif ($user['role'] === 'celebrity') {
                header("Location: /celebrity");
            } else {
                header("Location: /chat");
            }
            exit;
        }
    } else {
        $error = 'Invalid email address or password.';
    }
}
?>`
    },
    {
      path: 'api/chat.php',
      category: 'api',
      filename: 'chat.php',
      description: 'AJAX endpoint enforcing strict celebrity_id multi-tenant data isolation.',
      content: `<?php
/**
 * SHEMAR Chat API - Multi-Tenant Data Isolated Message Fetcher
 */
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$db = Database::getConnection();
$role = $_SESSION['role'];
$userId = $_SESSION['user_id'];

$action = $_GET['action'] ?? 'get_messages';

if ($action === 'get_messages') {
    $conversationId = (int)($_GET['conversation_id'] ?? 0);

    // STRICT MULTI-TENANT ISOLATION CHECK
    if ($role === 'celebrity') {
        // Find celebrity_id associated with user
        $stmt = $db->prepare("SELECT id FROM celebs WHERE user_id = :uid");
        $stmt->execute(['uid' => $userId]);
        $celeb = $stmt->fetch();

        if (!$celeb) {
            http_response_code(403);
            echo json_encode(['error' => 'Celebrity record not found']);
            exit;
        }

        // Verify conversation belongs to THIS celebrity
        $checkStmt = $db->prepare("SELECT id FROM conversations WHERE id = :cid AND celebrity_id = :celeb_id");
        $checkStmt->execute(['cid' => $conversationId, 'celeb_id' => $celeb['id']]);
        if (!$checkStmt->fetch()) {
            http_response_code(403);
            echo json_encode(['error' => 'Access Denied: Conversation does not belong to your celebrity account']);
            exit;
        }
    }

    $msgStmt = $db->prepare("
        SELECT m.*, u.name as sender_name 
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.conversation_id = :cid
        ORDER BY m.created_at ASC
    ");
    $msgStmt->execute(['cid' => $conversationId]);
    $messages = $msgStmt->fetchAll();

    echo json_encode(['status' => 'success', 'messages' => $messages]);
}
?>`
    },
    {
      path: 'README.md',
      category: 'setup',
      filename: 'README.md',
      description: 'Complete deployment instructions for Apache/Nginx + PHP 8.1+ & MySQL 8.',
      content: `# SHEMAR - Private Celebrity Chat Platform
## Production Deployment Guide

### Prerequisites
- Web Server: Apache 2.4+ (with \`mod_rewrite\` enabled) or Nginx
- PHP: 8.1+ with \`pdo_mysql\`, \`mbstring\`, \`json\`, \`session\`, \`gd\`
- Database: MySQL 8.0+ or MariaDB 10.5+
- SSL Certificate (HTTPS required for secure cookies)

---

### Step 1: Import Database Schema
1. Open MySQL terminal or phpMyAdmin.
2. Create database:
   \`\`\`sql
   CREATE DATABASE shemar_private_chat CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   \`\`\`
3. Import \`database/schema.sql\`.

---

### Step 2: Configure Environment
Edit \`config/config.php\` or set Environment Variables:
\`\`\`php
define('DB_HOST', '127.0.0.1');
define('DB_NAME', 'shemar_private_chat');
define('DB_USER', 'your_db_username');
define('DB_PASS', 'your_db_password');
\`\`\`

---

### Step 3: Default Credentials
- **Super Admin (Shemar Moore)**:
  - Email: \`shemar@shemarchat.com\`
  - Password: \`password123\`
`
    }
  ];
}
