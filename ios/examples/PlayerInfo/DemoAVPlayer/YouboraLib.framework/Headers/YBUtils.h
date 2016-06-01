//
//  YBUtils.h
//  YouboraLib
//
//  Created by Joan on 01/04/16.
//  Copyright © 2016 Nice People At Work. All rights reserved.
//

#import <Foundation/Foundation.h>

/**
 * Set of non class-specific helper methods. This is static class.
 */
@interface YBUtils : NSObject

/// ---------------------------------
/// @name Public methods
/// ---------------------------------
/**
 * Transforms the input string from jsonp to json
 * @param jsonp NSString with jsonp format.
 * @returns A NSString with json format, or nil if the parameter is not properly formatted.
 */
+ (NSString *) jsonFromJsonp:(NSString *) jsonp;


/**
 * Return number if it is non-nil and greater or equal than 0. In any other case, return defaultValue.
 * @param number NSNumber to be parsed.
 * @param defaultValue NSNumber to return if number is not valid.
 * @returns Either number or defaultValue.
 */
+ (NSNumber *) parseNumber:(NSNumber *) number withDefault:(NSNumber *) defaultValue;

@end
