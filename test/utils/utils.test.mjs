import { generateTGWebAppStartParam, getTGWebAppStartParam, StartParamKeyMap } from '../../dist/gamekit.mjs';
import assert                                                                  from 'assert';

describe( 'Utils', function () {
    const testChannel  = "testChannel";
    const testInviteId = "testInviteId";
    describe( '#generateTGWebAppStartParam()', function () {
        it( 'generate channel', function ( done ) {
            const str = generateTGWebAppStartParam( {
                channel : testChannel,
            } );
            assert( str === `${ StartParamKeyMap.channel }${ testChannel }` );
            done();
        } );
        it( 'generate invite', function ( done ) {
            const str = generateTGWebAppStartParam( {
                invite : testInviteId
            } );
            assert( str === `${ StartParamKeyMap.invite }${ testInviteId }` );
            done();
        } );

        it( 'generate all', function ( done ) {
            const str = generateTGWebAppStartParam( {
                channel : testChannel,
                invite  : testInviteId
            } );
            assert( str === `${ StartParamKeyMap.invite }${ testInviteId }-${ StartParamKeyMap.channel }${ testChannel }` ||
                str === `${ StartParamKeyMap.channel }${ testChannel }-${ StartParamKeyMap.invite }${ testInviteId }` );
            done();
        } );

        it( 'generate extra', function ( done ) {
            const str = generateTGWebAppStartParam( {
                test : 'abc'
            }, {
                test : 't_',
            } );
            assert( str === `t_abc` );
            done();
        } );

        it( 'generate mix', function ( done ) {
            const str = generateTGWebAppStartParam( {
                test    : 'abc',
                channel : 'cccc'
            }, {
                test : 't_',
            } );
            assert( str === `t_abc-${ StartParamKeyMap.channel }cccc` ||
                str === `${ StartParamKeyMap.channel }cccc-t_abc` );
            done();
        } );
    } );
    describe( '#getTGWebAppStartParam()', function () {
        it( 'parse channel', function ( done ) {
            const startParam = getTGWebAppStartParam( `${ StartParamKeyMap.channel }${ testChannel }` );
            assert( startParam.channel === testChannel );
            done();
        } );
        it( 'parse invite id', function ( done ) {
            const startParam = getTGWebAppStartParam( `${ StartParamKeyMap.invite }${ testInviteId }` );
            assert( startParam.invite === testInviteId );
            done();
        } );
        it( 'parse extra', function ( done ) {
            const startParam = getTGWebAppStartParam( `t_xxx`, {
                test : 't_'
            } );
            assert( startParam.test === 'xxx' );
            done();
        } );
        it( 'parse mix', function ( done ) {
            const startParam = getTGWebAppStartParam( `t_xxx-${ StartParamKeyMap.channel }${ testChannel }`, {
                test : 't_'
            } );
            assert( startParam.test === 'xxx' && startParam.channel === testChannel );
            done();
        } );
    } );
} );

