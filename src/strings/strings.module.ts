import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StringsController } from './strings.controller';
import { StringsService } from './strings.service';
import { AnalyzedString } from './entities/analyzed-string.entity';

/**
 * Strings module - handles all string analysis functionality
 */
@Module({
  imports: [
    // Register the AnalyzedString entity with TypeORM
    TypeOrmModule.forFeature([AnalyzedString]),
  ],
  controllers: [StringsController],
  providers: [StringsService],
  exports: [StringsService], // Export service if needed by other modules
})
export class StringsModule {}
