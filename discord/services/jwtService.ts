import type { JsonValue } from "@prisma/client/runtime/library";
import { CompactSign, compactVerify, exportJWK, generateSecret, importJWK, type JWK, type KeyLike } from "jose";
import { inject, Lifecycle, scoped } from "tsyringe";
import { DatabaseKeyValueStore } from "../utilities/databaseKeyValueStore";

@scoped(Lifecycle.ResolutionScoped)
export class JWTService {
	constructor(@inject(DatabaseKeyValueStore) private readonly kVStore: DatabaseKeyValueStore) { }

	private static key: KeyLike;
	private static readonly JWKIndex = "jwk";

	async getKey(): Promise<KeyLike> {
		if (JWTService.key) {
			return JWTService.key;
		}
		const foundJWK = await this.kVStore.get<JWK>(JWTService.JWKIndex);

		if (foundJWK) {
			JWTService.key = (await importJWK(foundJWK, "HS256")) as KeyLike;
			return JWTService.key;
		}

		JWTService.key = (await generateSecret("HS256", { extractable: true })) as KeyLike;
		const exportable = await exportJWK(JWTService.key);
		await this.kVStore.set(JWTService.JWKIndex, exportable as any);

		return JWTService.key;
	}

	async sign<T extends JsonValue>(message: T): Promise<string> {
		return await new CompactSign(new TextEncoder().encode(JSON.stringify(message)))
			.setProtectedHeader({ alg: "HS256" })
			.sign(await this.getKey());
	}

	async verify<T extends JsonValue>(jws: string | Uint8Array): Promise<T> {
		const { payload } = await compactVerify(jws, await this.getKey());

		return JSON.parse(new TextDecoder().decode(payload));
	}
}
