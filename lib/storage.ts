// Server-side module: it holds R2 credentials.
// Never import this from a client component.
import { randomBytes } from 'node:crypto'
import {
	DeleteObjectCommand,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3'
import { slugify } from '@/lib/utils'

function requireEnv(name: string): string {
	const value = process.env[name]
	if (!value) {
		throw new Error(`${name} is not set`)
	}
	return value
}

export function getStorageConfig() {
	const publicUrl = requireEnv('R2_PUBLIC_URL')
	if (!publicUrl.startsWith('https://')) {
		throw new Error('R2_PUBLIC_URL must be an absolute https:// URL')
	}

	return {
		accountId: requireEnv('R2_ACCOUNT_ID'),
		accessKeyId: requireEnv('R2_ACCESS_KEY_ID'),
		secretAccessKey: requireEnv('R2_SECRET_ACCESS_KEY'),
		bucketName: requireEnv('R2_BUCKET_NAME'),
		publicUrl: publicUrl.replace(/\/+$/, ''),
	}
}

let client: S3Client | undefined

function getClient(): S3Client {
	if (!client) {
		const config = getStorageConfig()
		client = new S3Client({
			region: 'auto',
			// The bucket was created in the EU jurisdiction; the default
			// endpoint (without `eu.`) answers 403 for it.
			endpoint: `https://${config.accountId}.eu.r2.cloudflarestorage.com`,
			credentials: {
				accessKeyId: config.accessKeyId,
				secretAccessKey: config.secretAccessKey,
			},
		})
	}
	return client
}

export function publicUrl(key: string): string {
	return `${getStorageConfig().publicUrl}/${key}`
}

export function buildObjectKey({
	folder,
	fileName,
	extension,
}: {
	folder: string
	fileName: string
	extension: string
}): string {
	// The extension comes from the validated content type, not the file name,
	// so every key ends in a canonical image extension.
	const dot = fileName.lastIndexOf('.')
	const base = dot > 0 ? fileName.slice(0, dot) : fileName
	const slug = slugify(base).slice(0, 80).replace(/-+$/, '') || 'file'
	const year = new Date().getUTCFullYear()
	const id = randomBytes(4).toString('hex')

	return `${folder}/${year}/${slug}-${id}.${extension}`
}

export async function uploadObject({
	key,
	body,
	contentType,
}: {
	key: string
	body: Uint8Array
	contentType: string
}): Promise<string> {
	const { bucketName } = getStorageConfig()

	await getClient().send(
		new PutObjectCommand({
			Bucket: bucketName,
			Key: key,
			Body: body,
			ContentType: contentType,
			CacheControl: 'public, max-age=31536000, immutable',
		}),
	)

	return publicUrl(key)
}

export async function deleteObject(key: string): Promise<void> {
	const { bucketName } = getStorageConfig()

	await getClient().send(
		new DeleteObjectCommand({ Bucket: bucketName, Key: key }),
	)
}
