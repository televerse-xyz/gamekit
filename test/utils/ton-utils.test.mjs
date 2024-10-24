import { formatAddress }   from '../../dist/ton-utils.mjs';
import { Address }         from "@ton/core";
import { keyPairFromSeed } from "@ton/crypto";
import crypto              from 'crypto';
import assert              from "assert";

async function generateRandomAddress () {
    const keyPair = await keyPairFromSeed( crypto.randomBytes( 32 ) );
    return Address.parse( "0:" + keyPair.publicKey.toString( 'hex' ) );
}

describe( 'Ton Utils', function () {
    it( '#formatAddress()', async function () {
        const address = await generateRandomAddress();
        const str     = formatAddress( address.toRawString() );
        assert( str === address.toString( {
            bounceable : false,
            testOnly   : false,
        } ) );
    } );
} );

