from pydantic import BaseModel
from typing import Optional
import logging
import weaviate.classes as wvc
from ..weaviate_pool import get_weaviate_client

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration constants
EMBEDDING_MODEL = "text-embedding-3-large"
BATCH_SIZE = 100
collection_name = "Visiting_students"


class VisitingStudent(BaseModel):
    name: str
    email: str
    gender: str
    grade: str
    residential_status: str
    city_country: str
    sports: Optional[str] = None
    extracurricular_activities: Optional[str] = None
    academic_interests: Optional[str] = None
    additional_information: Optional[str] = None
    race: Optional[str] = None
    tour_datetime: str
    is_matched: Optional[bool] = False
    matched_tour_guide: Optional[str] = None


def create_schema(weaviate_url=None, weaviate_api_key=None, openai_api_key=None, user_id=None):
    """Create the Weaviate schema for visiting students if it doesn't exist."""
    try:
        client = get_weaviate_client(weaviate_url, weaviate_api_key, openai_api_key, user_id)
        # List existing collections (schemas)
        existing_collections = client.collections.list_all()
        logger.info(f"Existing collections: {existing_collections}")
        
        if collection_name not in existing_collections:
            properties = [
                wvc.config.Property(
                    name="school",
                    data_type=wvc.config.DataType.TEXT,
                    description="School of the visiting student",
                    indexFilterable=True,
                    indexSearchable=True
                ),
                wvc.config.Property(
                    name="name",
                    data_type=wvc.config.DataType.TEXT,
                    description="Name of the visiting student",
                    indexFilterable=True,
                    indexSearchable=True
                ),
                wvc.config.Property(
                    name="email",
                    data_type=wvc.config.DataType.TEXT,
                    description="Email address of the visiting student",
                    indexFilterable=True,
                    indexSearchable=True
                ),
                wvc.config.Property(
                    name="gender",
                    data_type=wvc.config.DataType.TEXT,
                    description="Gender of the visiting student",
                    indexFilterable=True,
                    indexSearchable=True
                ),
                wvc.config.Property(
                    name="grade",
                    data_type=wvc.config.DataType.TEXT,
                    description="Grade level of the visiting student",
                    indexFilterable=True,
                    indexSearchable=True
                ),
                wvc.config.Property(
                    name="residential_status",
                    data_type=wvc.config.DataType.TEXT,
                    description="Residential status of the visiting student",
                    indexFilterable=True,
                    indexSearchable=True
                ),
                wvc.config.Property(
                    name="city_country",
                    data_type=wvc.config.DataType.TEXT,
                    description="City and country of the visiting student",
                    indexFilterable=True,
                    indexSearchable=True
                ),
                wvc.config.Property(
                    name="sports",
                    data_type=wvc.config.DataType.TEXT,
                    description="Sports interests of the visiting student",
                    indexFilterable=True,
                    indexSearchable=True
                ),
                wvc.config.Property(
                    name="extracurricular_activities",
                    data_type=wvc.config.DataType.TEXT,
                    description="Extracurricular activities of the visiting student",
                    indexFilterable=True,
                    indexSearchable=True
                ),
                wvc.config.Property(
                    name="academic_interests",
                    data_type=wvc.config.DataType.TEXT,
                    description="Academic interests of the visiting student",
                    indexFilterable=True,
                    indexSearchable=True
                ),
                wvc.config.Property(
                    name="additional_information",
                    data_type=wvc.config.DataType.TEXT,
                    description="Additional information about the visiting student",
                    indexFilterable=True,
                    indexSearchable=True
                ),
                wvc.config.Property(
                    name="race",
                    data_type=wvc.config.DataType.TEXT,
                    description="Race of the visiting student",
                    indexFilterable=True,
                    indexSearchable=True
                ),
                wvc.config.Property(
                    name="tour_datetime",
                    data_type=wvc.config.DataType.TEXT,
                    description="Date and time of the tour",
                    indexFilterable=True,
                    indexSearchable=True
                ),
                wvc.config.Property(
                    name="is_matched",
                    data_type=wvc.config.DataType.INT,
                    description="Whether the student has been matched with a tour guide (0=unmatched, 1=matched)",
                    indexFilterable=True,
                    indexSearchable=False
                ),
                wvc.config.Property(
                    name="matched_tour_guide",
                    data_type=wvc.config.DataType.TEXT,
                    description="The ID of the matched tour guide",
                    indexFilterable=True,
                    indexSearchable=True
                ),
                wvc.config.Property(
                    name="text_representation",
                    data_type=wvc.config.DataType.TEXT,
                    description="A text representation of the student's information for vector search",
                    indexFilterable=False,
                    indexSearchable=True,
                    tokenization=wvc.config.Tokenization.WORD
                )
            ]
            
            # Configure the OpenAI vectorizer
            vectorizer_config = wvc.config.Configure.NamedVectors.text2vec_openai(
                name="text_vector",
                source_properties=["text_representation"],
                model=EMBEDDING_MODEL,
                dimensions=3072
            )
            
            client.collections.create(
                name=collection_name,
                description="A visiting student with their information and vector embedding",
                properties=properties,
                vectorizer_config=[vectorizer_config],
            )
            logger.info(f"Created {collection_name} schema in Weaviate")
        else:
            logger.info(f"{collection_name} schema already exists")
    except Exception as e:
        logger.error(f"Error creating schema: {e}")
        raise


def create_text_representation(student: VisitingStudent) -> str:
    """Create text representation for vector search from student data."""
    text_fields = []
    if student.residential_status:
        text_fields.append(f"residential status: {student.residential_status}")
    if student.city_country:
        text_fields.append(f"city country: {student.city_country}")
    if student.sports:
        text_fields.append(f"sports: {student.sports}")
    if student.extracurricular_activities:
        text_fields.append(f"extracurricular activities: {student.extracurricular_activities}")
    if student.academic_interests:
        text_fields.append(f"academic interests: {student.academic_interests}")
    if student.additional_information:
        text_fields.append(f"additional information: {student.additional_information}")
    if student.race:
        text_fields.append(f"race: {student.race}")

    return ", ".join(text_fields)


def prepare_student_data(student: VisitingStudent, school_ceeb: str, text_representation: str) -> dict:
    """Prepare student data for insertion into Weaviate."""
    return {
        "school": school_ceeb,
        "name": student.name,
        "email": student.email,
        "gender": student.gender,
        "grade": student.grade,
        "residential_status": student.residential_status,
        "city_country": student.city_country,
        "sports": student.sports,
        "extracurricular_activities": student.extracurricular_activities,
        "academic_interests": student.academic_interests,
        "additional_information": student.additional_information,
        "race": student.race,
        "tour_datetime": student.tour_datetime,
        "is_matched": 0,  # Initialize as unmatched (0)
        "matched_tour_guide": student.matched_tour_guide,
        "text_representation": text_representation
    } 