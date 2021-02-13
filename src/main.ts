import { NestFactory } from "@nestjs/core"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import { AppModule } from "./app.module"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.setGlobalPrefix("api")
  app.enableCors({
    origin: process.env.CORS_ORIGIN,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
  const config = new DocumentBuilder()
    .setTitle("Sport Complex Booking API")
    .setDescription("API documentation")
    .setVersion("1.0")
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup("api/doc", app, document)
  //app.useGlobalPipes(new ValidationPipe({transform: true}));
  await app.listen(3000)
}
bootstrap()
