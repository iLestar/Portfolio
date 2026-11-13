import {
  IsArray,
  ArrayMaxSize,
  ArrayMinSize,
  Matches,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator'
import { Transform, Type } from 'class-transformer'

const CATEGORIES = ['branding', 'ilustracion', 'editorial', 'fotografia', 'retoque', 'desarrollo', 'otros'] as const
const KINDS = ['result', 'process'] as const
const SECTION_KEYS = ['briefing', 'bocetos', 'decisiones', 'resultado'] as const

export class SectionDto {
  @IsIn(SECTION_KEYS)
  key: (typeof SECTION_KEYS)[number]

  @IsOptional()
  @IsString()
  image: string | null = null

  @IsString()
  es: string

  @IsString()
  en: string
}

export class AttachmentDto {
  @IsString()
  url: string

  @IsString()
  @MaxLength(200)
  name: string
}

export class GalleryDto {
  @IsString() @Matches(/^\/uploads\/[a-zA-Z0-9._-]+$/)
  url: string

  @IsString() @MaxLength(2000)
  es: string

  @IsString() @MaxLength(2000)
  en: string
}

export class ContributorDto {
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString() @MinLength(1) @MaxLength(200)
  name: string

  @Transform(({ value }) => typeof value === 'string' ? value.trim() || null : value)
  @IsOptional() @IsUrl({ protocols: ['https', 'http'], require_protocol: true }) @MaxLength(1000)
  url: string | null = null
}

export class ProjectContentDto {
  @IsOptional() @IsArray() @ArrayMaxSize(50) @ValidateNested({ each: true }) @Type(() => ContributorDto)
  contributors?: ContributorDto[] | null

  @IsOptional() @IsArray() @ArrayMinSize(1) @ArrayMaxSize(7) @IsIn(CATEGORIES, { each: true })
  categories?: string[]

  @IsOptional() @IsString() @MaxLength(10000)
  creditsEs?: string | null

  @IsOptional() @IsString() @MaxLength(10000)
  creditsEn?: string | null

  @IsOptional() @IsArray() @ArrayMaxSize(100) @ValidateNested({ each: true }) @Type(() => GalleryDto)
  gallery?: GalleryDto[] | null

  @IsOptional() @IsString() @Matches(/^\/uploads\/[a-zA-Z0-9._-]+\.pdf$/i)
  documentUrl?: string | null
}

export class CreateProjectDto extends ProjectContentDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  slug: string

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title: string

  @IsInt()
  @Min(1990)
  @Max(2100)
  year: number

  @IsIn(CATEGORIES)
  category: (typeof CATEGORIES)[number]

  @IsIn(KINDS)
  kind: (typeof KINDS)[number]

  @IsOptional()
  @IsString()
  cover: string | null = null

  @IsArray()
  @IsString({ each: true })
  tools: string[] = []

  @IsString()
  summaryEs: string

  @IsString()
  summaryEn: string

  @IsOptional()
  @IsString()
  bodyEs: string | null = null

  @IsOptional()
  @IsString()
  bodyEn: string | null = null

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SectionDto)
  sections: SectionDto[] | null = null

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments: AttachmentDto[] | null = null

  @IsOptional()
  @IsBoolean()
  featured: boolean = false

  @IsOptional()
  @IsBoolean()
  published: boolean = false

  @IsOptional()
  @IsInt()
  sortOrder: number = 0
}

// PartialType manual: todo opcional en el update
export class UpdateProjectDto extends ProjectContentDto {
  @IsOptional() @IsBoolean() translationReviewed?: boolean
  @IsOptional() @IsString() @MinLength(2) @MaxLength(120) slug?: string
  @IsOptional() @IsString() @MinLength(2) @MaxLength(200) title?: string
  @IsOptional() @IsInt() @Min(1990) @Max(2100) year?: number
  @IsOptional() @IsIn(CATEGORIES) category?: (typeof CATEGORIES)[number]
  @IsOptional() @IsIn(KINDS) kind?: (typeof KINDS)[number]
  @IsOptional() @IsString() cover?: string | null
  @IsOptional() @IsArray() @IsString({ each: true }) tools?: string[]
  @IsOptional() @IsString() summaryEs?: string
  @IsOptional() @IsString() summaryEn?: string
  @IsOptional() @IsString() bodyEs?: string | null
  @IsOptional() @IsString() bodyEn?: string | null
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => SectionDto)
  sections?: SectionDto[] | null
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => AttachmentDto)
  attachments?: AttachmentDto[] | null
  @IsOptional() @IsBoolean() featured?: boolean
  @IsOptional() @IsBoolean() published?: boolean
  @IsOptional() @IsInt() sortOrder?: number
}
