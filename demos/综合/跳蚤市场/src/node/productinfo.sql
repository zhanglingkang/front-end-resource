/*
Navicat MySQL Data Transfer

Source Server         : MySql
Source Server Version : 50018
Source Host           : localhost:3306
Source Database       : secondhandproduct

Target Server Type    : MYSQL
Target Server Version : 50018
File Encoding         : 65001

Date: 2013-06-24 16:34:30
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for `productinfo`
-- ----------------------------
DROP TABLE IF EXISTS `productinfo`;
CREATE TABLE `productinfo` (
  `prodId` int(11) NOT NULL auto_increment,
  `name` varchar(255) NOT NULL,
  `imgSrc` varchar(255) default NULL,
  `label` varchar(255) default NULL,
  `qq` varchar(255) default NULL,
  `mobile` varchar(255) default NULL,
  `ownerName` varchar(255) NOT NULL,
  `describe` varchar(255) NOT NULL,
  `updateTime` timestamp NULL default NULL on update CURRENT_TIMESTAMP,
  PRIMARY KEY  (`prodId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of productinfo
-- ----------------------------
INSERT INTO `productinfo` VALUES ('1', '国际象棋', '/uploadImg/26f7137e27b252bddf5e090b2653d726.jpg', '益智玩具', '570491525', null, 'Joel', '无', '2013-06-24 14:30:32');
INSERT INTO `productinfo` VALUES ('4', '咪兔公仔', 'http://ww1.sinaimg.cn/small/c01ce6degw1e5tkf8fd6bj21kw16oqpg.jpg', '八成新,玩偶', '570491525', null, 'Joel', '漂亮的咪兔公仔，里面是棉花，手感很好', null);
INSERT INTO `productinfo` VALUES ('5', '玄机盒', '/uploadImg/e647637459aa68a3abb80c2dff32cc95.jpg', '八成新,玩具,藏秘密', null, '13812660377', 'Joel', '外表看，只是普通的盒子，内部其实是可以打开的哦~即，所谓玄机', '2013-06-24 14:27:57');
INSERT INTO `productinfo` VALUES ('6', 'Mp3套', '', '电子产品配件', '570491525', null, 'Joel', '橘色的套子，外面有绒毛', '2013-06-24 14:54:54');
-- DELETE  FROM `productinfo` WHERE prodId > 6;
-- UPDATE productinfo as p set searchStr = CONCAT(name,'|',label,'|',p.describe)