import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class KeysService {
  private privateKeyPem: string;
  private publicKeyPem: string;
  private kid: string;

  constructor() {
    const envPrivate = process.env.JWT_PRIVATE_KEY;
    const envPublic = process.env.JWT_PUBLIC_KEY;

    if (envPrivate && envPublic) {
      // Decode PEM, handling standard newline characters if escaped
      this.privateKeyPem = envPrivate.replace(/\\n/g, '\n');
      this.publicKeyPem = envPublic.replace(/\\n/g, '\n');
    } else {
      // Fallback: Generate RS256 keys dynamically
      const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem',
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem',
        },
      });
      this.privateKeyPem = privateKey;
      this.publicKeyPem = publicKey;
    }

    // Generate a unique Key ID (kid) based on the SHA-256 hash of the public key
    this.kid = crypto
      .createHash('sha256')
      .update(this.publicKeyPem)
      .digest('hex')
      .substring(0, 16);
  }

  getPrivateKey(): string {
    return this.privateKeyPem;
  }

  getPublicKey(): string {
    return this.publicKeyPem;
  }

  getKid(): string {
    return this.kid;
  }

  getJwks() {
    const keyObject = crypto.createPublicKey(this.publicKeyPem);
    const jwk = keyObject.export({ format: 'jwk' }) as any;

    return {
      keys: [
        {
          kty: jwk.kty, // "RSA"
          use: 'sig',
          alg: 'RS256',
          kid: this.kid,
          n: jwk.n,
          e: jwk.e,
        },
      ],
    };
  }
}
