//
//  YBCDN.h
//  YouboraLib
//
//  Created by Joan on 12/04/16.
//  Copyright © 2016 Nice People At Work. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "YBCDNHeader.h"
/**
 * This class allows to define a CDN for the <YBResourceParser>. Each CDN definition consists of a set of <YBCDNHeader>s and a dictionary of request headers:
 * 
 * - the request headers are key-value entries to send as http headers when performing the http head requests to get info about the CDN.
 * - the <YBCDNHeader> instances tell us what and how to extract from the headers in the http head responses.
 */
@interface YBCDN : NSObject
/// ---------------------------------
/// @name Init
/// ---------------------------------
/**
 * Init
 * @param headers NSArray of <YBCDNHeader>s
 * @param requestHeaders NSDictionary containing key-value entries to send as http headers when performing the http head requests to get info about the CDN.
 */
- (instancetype)initWithHeaders:(NSArray <YBCDNHeader *> *) headers andRequestHeaders:(NSDictionary <NSString *, NSString *> *) requestHeaders;

/// <YBCDNHeader> instances tell us what and how to extract from the headers in the http head responses.
@property (nonatomic, strong) NSArray <YBCDNHeader *> * headers;
/// Key-value entries to send as http headers when performing the http head requests to get info about the CDN.
@property (nonatomic, strong) NSDictionary <NSString *, NSString *> * requestHeaders;

@end
