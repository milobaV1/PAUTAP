import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TriviaService } from './trivia.service';
import { CreateTriviaDto } from './dto/create-trivia.dto';
import { UpdateTriviaDto } from './dto/update-trivia.dto';
import { LeaderboardQueryDto } from './dto/leaderboard-query.dto';
import { StartTriviaDto } from './dto/start-trivia.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('access-token')
@Controller('trivia')
@UseGuards(RolesGuard)
export class TriviaController {
  constructor(private readonly triviaService: TriviaService) {}

  @Get('current')
  async getCurrentTrivia(@Request() req) {
    const trivia = await this.triviaService.getCurrentTrivia();

    if (!trivia) {
      return { message: 'No active trivia available' };
    }

    // Check if user has already participated
    const participation = await this.triviaService.getUserParticipation(
      trivia.id,
      req.user.id,
    );

    return {
      trivia,
      userParticipation: participation,
      canParticipate:
        trivia.canParticipate() &&
        (!participation || participation.status === 'in_progress'),
    };
  }

  @Post('start')
  async startTrivia(@Body() startTriviaDto: StartTriviaDto) {
    console.log('This is the start trivia dto: ', startTriviaDto);
    const participation = await this.triviaService.startTrivia(
      startTriviaDto.triviaId,
      startTriviaDto.userId,
    );

    // Get trivia questions
    const questions = await this.triviaService.getTriviaQuestions(
      startTriviaDto.triviaId,
    );

    // Remove correct answers from response
    const sanitizedQuestions = questions.map((q) => ({
      id: q.id,
      question: q.questionText,
      options: q.options,
      category: q.crispCategory,
      // difficulty: q.difficultyLevel,
      // Don't include correctAnswer in response
    }));

    return {
      participation,
      questions: sanitizedQuestions,
    };
  }

  @Post('answer')
  async submitAnswer(@Body() submitAnswerDto: SubmitAnswerDto) {
    return this.triviaService.submitAnswer(
      submitAnswerDto.participationId,
      submitAnswerDto.questionId,
      submitAnswerDto.selectedAnswer,
      submitAnswerDto.timeSpent,
    );
  }

  @Post('submit/:participationId')
  async submitTrivia(@Param('participationId') participationId: string) {
    return this.triviaService.submitTrivia(participationId);
  }

  @Get('participation/:triviaId')
  async getUserParticipation(
    @Param('triviaId') triviaId: string,
    @Request() req,
  ) {
    return this.triviaService.getUserParticipation(triviaId, req.user.id);
  }

  @Get('leaderboard')
  async getLeaderboard(@Query() query: LeaderboardQueryDto) {
    return this.triviaService.getLeaderboard(query.month, query.year);
  }

  @Get('my-stats')
  async getMyStats(@Request() req, @Query() query: LeaderboardQueryDto) {
    const leaderboard = await this.triviaService.getLeaderboard(
      query.month,
      query.year,
    );
    const myStats = leaderboard.find((entry) => entry.userId === req.user.id);

    return {
      stats: myStats || null,
      totalParticipants: leaderboard.length,
    };
  }
}
