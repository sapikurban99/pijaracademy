# Login API Documentation

## Endpoint
- Method: `POST`
- URL: `/api/login`
- Content-Type: `application/json`

## Deskripsi
Endpoint untuk autentikasi user menggunakan email dan password.
Jika berhasil, endpoint mengembalikan JWT token dan role user.

## Request Body

### Field
- `email` (`string`, required): Email user terdaftar.
- `password` (`string`, required): Password user.

### Contoh Request
```json
{
  "email": "member@pijar.com",
  "password": "Password123!"
}
```

## Success Response
- HTTP Status: `200 OK`

### Body
```json
{
  "message": "Login successful",
  "token": "<jwt_token>",
  "roleSlug": "global:member"
}
```

### Keterangan Field
- `message` (`string`): Status login.
- `token` (`string`): JWT token untuk akses endpoint terproteksi.
- `roleSlug` (`string`): Role user (`global:member`, `global:admin`, `global:owner`).

## Error Response
- HTTP Status: `400 Bad Request`

### Contoh: Email / Password salah
```json
{
  "message": "Invalid email or password"
}
```

### Contoh: Payload tidak valid
```json
{
  "message": "Invalid email or password"
}
```

## Contoh cURL
```bash
curl -X POST 'http://localhost:3000/api/login' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "member@pijar.com",
    "password": "Password123!"
  }'
```

## Penggunaan Token (Setelah Login)
Gunakan nilai `token` pada header `Authorization` untuk endpoint terproteksi.

Contoh:
```http
Authorization: <jwt_token>
```

Catatan: implementasi saat ini menggunakan token mentah pada header `Authorization` (tanpa prefix `Bearer`).

## Redirect Frontend (Referensi)
- `global:admin` / `global:owner` -> `/dashboard/admin`
- selain itu -> `/dashboard`
