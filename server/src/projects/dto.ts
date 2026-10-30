import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'

const CATEGORIES = ['branding', 'ilustracion', 'editorial', 'otros'] as const
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

export class CreateProjectDto {
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
  @IsBoolean()
  featured: boolean = false

  @IsOptional()
  @IsBoolean()
  published: boolean = true

  @IsOptional()
  @IsInt()
  sortOrder: number = 0
}

// PartialType manual: todo opcional en el update
export class UpdateProjectDto {
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
  @IsOptional() @IsBoolean() featured?: boolean
  @IsOptional() @IsBoolean() published?: boolean
  @IsOptional() @IsInt() sortOrder?: number
}
